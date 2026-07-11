import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  IPaymentGateway,
  PaymentPayload,
  PaymentResponse,
  WebhookResult,
} from '../interfaces/payment-gateway.interface';
import { Currency } from '../entities/shop.entity';

export interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
    };
  };
}

@Injectable()
export class PaystackGateway implements IPaymentGateway {
  private readonly logger = new Logger(PaystackGateway.name);
  private readonly secretKey = process.env.PAYSTACK_SECRET_KEY || '';

  getName(): string {
    return 'paystack';
  }

  async initializePayment(payload: PaymentPayload): Promise<PaymentResponse> {
    if (!this.secretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY not configured');
      return {
        success: false,
        reference: payload.reference,
        gateway: this.getName(),
        error: 'Paystack API key not configured',
      };
    }

    // Paystack requires amount in the smallest currency unit:
    // NGN → kobo (*100), USD → cents (*100), EUR → cents (*100)
    const paystackAmount = Math.round(payload.totalAmount * 100);

    const paystackPayload = {
      reference: payload.reference,
      amount: paystackAmount,
      currency: payload.currency,
      email: payload.customerEmail,
      callback_url: payload.redirectUrl,
      metadata: {
        order_ids: payload.orders.map((o) => o.id).join(','),
        payment_refs: payload.orders.map((o) => o.paymentRef).join(','),
        ...payload.metadata,
      },
    };

    try {
      const response = await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paystackPayload),
        },
      );

      const result = await response.json();

      if (result.status === true) {
        this.logger.debug(`Paystack payment initialized: ${payload.reference}`);
        return {
          success: true,
          gateway: this.getName(),
          paymentLink: result.data.authorization_url,
          reference: payload.reference,
          orders: payload.orders.map((o) => ({
            id: o.id as string,
            paymentRef: o.paymentRef as string,
            amount: Number(o.amountPaid),
            currency: o.currency as Currency,
          })),
        };
      } else {
        this.logger.error(`Paystack error: ${result.message}`);
        return {
          success: false,
          gateway: this.getName(),
          reference: payload.reference,
          error: `Paystack error: ${result.message}`,
        };
      }
    } catch (error) {
      this.logger.error('Paystack payment initialization failed:', error);
      return {
        success: false,
        gateway: this.getName(),
        reference: payload.reference,
        error: 'Payment link generation failed',
        message:
          'Orders created. Paystack payment link could not be generated (check API keys).',
        orders: payload.orders.map((o) => ({
          id: o.id as string,
          paymentRef: o.paymentRef as string,
          amount: Number(o.amountPaid),
          currency: o.currency as Currency,
        })),
      };
    }
  }

  verifyWebhookSignature(
    headers: Record<string, string>,
    _body: unknown,
    rawBody?: Buffer,
  ): boolean {
    const signature = headers['x-paystack-signature'];
    if (!signature) {
      this.logger.warn('Paystack webhook missing x-paystack-signature header');
      return false;
    }

    if (!this.secretKey) {
      this.logger.error(
        'PAYSTACK_SECRET_KEY not configured for webhook verification',
      );
      return false;
    }

    try {
      // Use rawBody if available, otherwise fallback to JSON.stringify
      const verificationData = rawBody ? rawBody : JSON.stringify(_body);

      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(verificationData)
        .digest('hex');

      const isValid = hash === signature;
      if (!isValid) {
        this.logger.warn('Paystack webhook signature verification failed', {
          received: signature,
          calculated: hash,
        });
      }
      return isValid;
    } catch (error) {
      this.logger.error('Paystack webhook verification error:', error);
      return false;
    }
  }

  handleWebhookEvent(payload: unknown): WebhookResult {
    const { event, data } = payload as PaystackWebhookPayload;

    if (event === 'charge.success' && data.status === 'success') {
      this.logger.debug(`Paystack charge successful: ${data.reference}`);
      return {
        processed: true,
        reference: data.reference,
        status: 'success',
      };
    }

    this.logger.debug(`Paystack unhandled event type: ${event}`);
    return {
      processed: false,
      error: `Unhandled event type: ${event}`,
    };
  }
}
