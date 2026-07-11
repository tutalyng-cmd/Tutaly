import { Currency } from '../entities/shop.entity';
import { Order } from '../entities/order.entity';

/**
 * Normalized payment payload for all gateways
 */
export interface PaymentPayload {
  orders: Partial<Order>[];
  totalAmount: number;
  currency: Currency;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
  metadata: Record<string, unknown>;
  reference: string;
}

/**
 * Normalized payment response from all gateways
 */
export interface PaymentResponse {
  success: boolean;
  paymentLink?: string;
  reference: string;
  gateway: string;
  orders?: Array<{
    id: string;
    paymentRef: string;
    amount: number;
    currency: Currency;
  }>;
  message?: string;
  error?: string;
}

/**
 * Normalized webhook result
 */
export interface WebhookResult {
  processed: boolean;
  reference?: string;
  status?: string;
  error?: string;
}

/**
 * Payment Gateway Interface — All gateways must implement this contract
 */
export interface IPaymentGateway {
  /**
   * Initialize a payment with the gateway
   */
  initializePayment(payload: PaymentPayload): Promise<PaymentResponse>;

  /**
   * Verify webhook signature/authenticity
   */
  verifyWebhookSignature(
    headers: Record<string, string>,
    body: unknown,
    rawBody?: Buffer,
  ): Promise<boolean> | boolean;

  /**
   * Handle webhook event from payment gateway
   * Should extract payment reference and metadata, return processed result
   */
  handleWebhookEvent(payload: unknown): Promise<WebhookResult> | WebhookResult;

  /**
   * Get gateway name for logging/debugging
   */
  getName(): string;
}
