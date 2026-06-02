import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Currency } from '../entities/shop.entity';

/**
 * Exchange rate (against base currency USD)
 */
interface ExchangeRates {
  [key: string]: number;
  NGN: number;
  USD: number;
  EUR: number;
}

/**
 * Currency conversion service
 * Handles multi-currency conversions using cached exchange rates
 * In production, integrate with a real-time rate API (e.g., fixer.io, exchangerate-api.com)
 */
@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);

  /**
   * In-memory cache for exchange rates (to USD as base)
   * Should be updated hourly from a real-time API
   * These are approximate rates as of 2026-06-02
   */
  private exchangeRates: ExchangeRates = {
    USD: 1.0, // Base currency
    EUR: 0.92, // 1 EUR = 0.92 USD (approximate)
    NGN: 0.0015, // 1 NGN = 0.0015 USD (approximately 650 NGN = 1 USD)
  };

  /**
   * Last update timestamp
   */
  private lastUpdatedAt: Date = new Date();

  /**
   * Cache duration in milliseconds (1 hour)
   */
  private readonly CACHE_DURATION = 60 * 60 * 1000;

  constructor() {
    this.logger.log('Currency conversion service initialized');
  }

  /**
   * Convert amount from one currency to another
   * @param amount The amount to convert
   * @param fromCurrency Source currency
   * @param toCurrency Target currency
   * @returns Converted amount
   */
  convert(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    if (!this.exchangeRates[fromCurrency]) {
      throw new BadRequestException(`Unsupported currency: ${fromCurrency}`);
    }

    if (!this.exchangeRates[toCurrency]) {
      throw new BadRequestException(`Unsupported currency: ${toCurrency}`);
    }

    try {
      // Convert to USD (base), then to target currency
      const amountInUSD = amount / this.exchangeRates[fromCurrency];
      const convertedAmount = amountInUSD * this.exchangeRates[toCurrency];

      this.logger.debug(
        `Converted ${amount} ${fromCurrency} → ${convertedAmount.toFixed(2)} ${toCurrency}`,
      );

      return Number(convertedAmount.toFixed(2));
    } catch (error) {
      this.logger.error(
        `Currency conversion failed: ${fromCurrency} → ${toCurrency}`,
        error,
      );
      throw new BadRequestException('Currency conversion failed');
    }
  }

  /**
   * Get current exchange rates
   */
  getExchangeRates(): ExchangeRates {
    return { ...this.exchangeRates };
  }

  /**
   * Update exchange rates (typically called by a scheduled job)
   * In production, this should fetch from a real-time API
   */
  async updateExchangeRates(): Promise<void> {
    try {
      // Check if cache is still valid
      const timeSinceLastUpdate = Date.now() - this.lastUpdatedAt.getTime();
      if (timeSinceLastUpdate < this.CACHE_DURATION) {
        this.logger.debug('Exchange rates cache still valid');
        return;
      }

      /**
       * PRODUCTION TODO:
       * Integrate with real-time exchange rate API:
       * - fixer.io
       * - exchangerate-api.com
       * - open-exchange-rates.org
       * - xe.com API
       *
       * Example using exchangerate-api.com:
       * const response = await fetch('https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD');
       * const data = await response.json();
       * this.exchangeRates = data.conversion_rates;
       */

      this.logger.debug('Exchange rates would be updated from external API');
      this.lastUpdatedAt = new Date();
    } catch (error) {
      this.logger.error('Failed to update exchange rates:', error);
      // Keep using cached rates on error
    }
  }

  /**
   * Set exchange rates manually (for testing or manual updates)
   */
  setExchangeRates(rates: Partial<ExchangeRates>): void {
    Object.assign(this.exchangeRates, rates);
    this.lastUpdatedAt = new Date();
    this.logger.log('Exchange rates updated manually');
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return Object.keys(this.exchangeRates) as Currency[];
  }

  /**
   * Check if a currency is supported
   */
  isSupportedCurrency(currency: Currency): boolean {
    return currency in this.exchangeRates;
  }
}
