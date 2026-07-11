import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import {
  IPaymentGateway,
  PaymentPayload,
  PaymentResponse,
  WebhookResult,
} from '../interfaces/payment-gateway.interface';
import { Currency } from '../entities/shop.entity';

@Injectable()
export class StripeGateway implements IPaymentGateway {
  private readonly logger = new Logger(StripeGateway.name);
  private stripe: Stripe | null = null;
  private readonly webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    } else {
      this.logger.warn('STRIPE_SECRET_KEY not configured');
    }
  }

  getName(): string {
    return 'stripe';
  }

  async initializePayment(payload: PaymentPayload): Promise<PaymentResponse> {
    if (!this.stripe) {
      return {
        success: false,
        reference: payload.reference,
        gateway: this.getName(),
        error: 'Stripe API key not configured',
      };
    }

    try {
      // Stripe expects amount in the smallest currency unit (e.g., cents for USD, kobo for NGN)
      // Check if it's a zero-decimal currency (like JPY) if needed in future.
      const amount = Math.round(payload.totalAmount * 100);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: payload.customerEmail,
        client_reference_id: payload.reference,
        line_items: [
          {
            price_data: {
              currency: payload.currency.toLowerCase(),
              product_data: {
                name: 'Tutaly Shop Payment',
                description: `Payment for ${payload.orders.length} item(s)`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${payload.redirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.WEB_URL || 'http://localhost:3000'}/shop/cart`,
        metadata: {
          order_ids: payload.orders.map((o) => o.id).join(','),
          payment_refs: payload.orders.map((o) => o.paymentRef).join(','),
          ...payload.metadata,
        },
      });

      this.logger.debug(`Stripe payment initialized: ${payload.reference}`);
      return {
        success: true,
        gateway: this.getName(),
        paymentLink: session.url || undefined,
        reference: payload.reference,
        orders: payload.orders.map((o) => ({
          id: o.id as string,
          paymentRef: o.paymentRef as string,
          amount: Number(o.amountPaid),
          currency: o.currency as Currency,
        })),
      };
    } catch (error) {
      this.logger.error('Stripe payment initialization failed:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Payment link generation failed';
      return {
        success: false,
        gateway: this.getName(),
        reference: payload.reference,
        error: errorMessage,
        message: 'Orders created. Stripe payment link could not be generated.',
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
    body: unknown,
    rawBody?: Buffer,
  ): boolean {
    const signature = headers['stripe-signature'];
    if (!signature) {
      this.logger.warn('Stripe webhook missing stripe-signature header');
      return false;
    }

    if (!this.webhookSecret || !this.stripe) {
      this.logger.error(
        'Stripe credentials not configured for webhook verification',
      );
      return false;
    }

    if (!rawBody) {
      this.logger.error('Raw body required for Stripe webhook verification');
      return false;
    }

    try {
      this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
      return true;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Unknown verification error';
      this.logger.warn(`Stripe webhook signature verification failed: ${msg}`);
      return false;
    }
  }

  handleWebhookEvent(payload: unknown): WebhookResult {
    // The payload is already constructed and verified by verifyWebhookSignature if called properly
    // However, constructEvent returns the typed event. If we just receive the parsed JSON body here:
    const event = payload as Stripe.Event;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const reference = session.client_reference_id || undefined;

      this.logger.debug(`Stripe charge successful: ${reference}`);
      return {
        processed: true,
        reference: reference,
        status: 'success',
      };
    }

    this.logger.debug(`Stripe unhandled event type: ${event.type}`);
    return {
      processed: false,
      error: `Unhandled event type: ${event.type}`,
    };
  }
}
