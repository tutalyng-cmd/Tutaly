import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentGateway,
  PaymentPayload,
  PaymentResponse,
  WebhookResult,
} from '../interfaces/payment-gateway.interface';
import { Currency } from '../entities/shop.entity';

export interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    status: string;
    tx_ref: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
    };
  };
}

@Injectable()
export class FlutterwaveGateway implements IPaymentGateway {
  private readonly logger = new Logger(FlutterwaveGateway.name);
  private readonly secretKey = process.env.FLUTTER_WAVE_SECRET_KEY || '';
  private readonly encryptionKey =
    process.env.FLUTTER_WAVE_ENCRYPTION_KEY || '';

  getName(): string {
    return 'flutterwave';
  }

  async initializePayment(payload: PaymentPayload): Promise<PaymentResponse> {
    if (!this.secretKey) {
      this.logger.warn('FLUTTER_WAVE_SECRET_KEY not configured');
      return {
        success: false,
        reference: payload.reference,
        gateway: this.getName(),
        error: 'Flutterwave API key not configured',
      };
    }

    const flutterwavePayload = {
      tx_ref: payload.reference,
      amount: payload.totalAmount, // Flutterwave accepts major currency units
      currency: payload.currency,
      redirect_url: payload.redirectUrl,
      customer: {
        email: payload.customerEmail,
        name: payload.customerName || 'Tutaly Buyer',
      },
      meta: {
        order_ids: payload.orders.map((o) => o.id).join(','),
        payment_refs: payload.orders.map((o) => o.paymentRef).join(','),
        ...payload.metadata,
      },
      customizations: {
        title: 'Tutaly Shop',
        description: `Payment for ${payload.orders.length} item(s)`,
      },
    };

    try {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flutterwavePayload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        this.logger.debug(
          `Flutterwave payment initialized: ${payload.reference}`,
        );
        return {
          success: true,
          gateway: this.getName(),
          paymentLink: result.data.link,
          reference: payload.reference,
          orders: payload.orders.map((o) => ({
            id: o.id as string,
            paymentRef: o.paymentRef as string,
            amount: Number(o.amountPaid),
            currency: o.currency as Currency,
          })),
        };
      } else {
        this.logger.error(`Flutterwave error: ${result.message}`);
        return {
          success: false,
          gateway: this.getName(),
          reference: payload.reference,
          error: `Flutterwave error: ${result.message}`,
        };
      }
    } catch (error) {
      this.logger.error('Flutterwave payment initialization failed:', error);
      return {
        success: false,
        gateway: this.getName(),
        reference: payload.reference,
        error: 'Payment link generation failed',
        message:
          'Orders created. Flutterwave payment link could not be generated (check API keys).',
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
    _rawBody?: Buffer,
  ): boolean {
    const verifHash = headers['verif-hash'];
    if (!verifHash) {
      this.logger.warn('Flutterwave webhook missing verif-hash header');
      return false;
    }

    const secretHash = this.encryptionKey;
    if (!secretHash) {
      this.logger.error('FLUTTER_WAVE_ENCRYPTION_KEY not configured');
      return false;
    }

    const isValid = verifHash === secretHash;
    if (!isValid) {
      this.logger.warn('Flutterwave webhook signature verification failed');
    }
    return isValid;
  }

  handleWebhookEvent(payload: unknown): WebhookResult {
    const { event, data } = payload as FlutterwaveWebhookPayload;

    if (event === 'charge.completed' && data.status === 'successful') {
      this.logger.debug(`Flutterwave charge completed: ${data.tx_ref}`);
      return {
        processed: true,
        reference: data.tx_ref,
        status: 'completed',
      };
    }

    this.logger.debug(`Flutterwave unhandled event type: ${event}`);
    return {
      processed: false,
      error: `Unhandled event type: ${event}`,
    };
  }
}
