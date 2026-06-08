import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentGateway } from '../entities/order.entity';
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { FlutterwaveGateway } from './flutterwave.gateway';
import { PaystackGateway } from './paystack.gateway';
import { StripeGateway } from './stripe.gateway';

/**
 * Factory for creating payment gateway instances
 * Implements the Factory pattern to decouple gateway creation from usage
 */
@Injectable()
export class PaymentGatewayFactory {
  constructor(
    private readonly flutterwaveGateway: FlutterwaveGateway,
    private readonly paystackGateway: PaystackGateway,
    private readonly stripeGateway: StripeGateway,
  ) {}

  /**
   * Create a gateway instance by type
   */
  create(gateway: PaymentGateway): IPaymentGateway {
    switch (gateway) {
      case PaymentGateway.FLUTTERWAVE:
        return this.flutterwaveGateway;
      case PaymentGateway.PAYSTACK:
        return this.paystackGateway;
      case PaymentGateway.STRIPE:
        return this.stripeGateway;
      default:
        throw new BadRequestException(
          'Unknown payment gateway: ' + String(gateway),
        );
    }
  }

  /**
   * Get gateway by string name (useful for webhook routing)
   */
  createByName(gatewayName: string): IPaymentGateway {
    const normalized = gatewayName.toLowerCase().trim();
    if (normalized === 'flutterwave') {
      return this.flutterwaveGateway;
    }
    if (normalized === 'paystack') {
      return this.paystackGateway;
    }
    if (normalized === 'stripe') {
      return this.stripeGateway;
    }
    throw new BadRequestException(`Unknown payment gateway: ${gatewayName}`);
  }
}
