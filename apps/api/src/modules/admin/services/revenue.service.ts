import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../../shop/entities/order.entity';

export interface RevenueTotalsResult {
  grossRevenue: string | number;
  totalCommission: string | number;
  totalSellerPayables: string | number;
  totalOrders: string | number;
}

export interface RevenueByGatewayResult {
  gateway: string;
  grossRevenue: string | number;
  commission: string | number;
  orderCount: string | number;
}

export interface RevenueTimeSeriesResult {
  period: string;
  grossRevenue: string | number;
  commission: string | number;
  orderCount: string | number;
}

export interface CommissionTotalResult {
  total: string | number;
}

export interface CommissionByCategoryResult {
  category: string;
  commission: string | number;
}

export interface CommissionBySellerResult {
  sellerId: string;
  email: string;
  commission: string | number;
}

function toPlain<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

@Injectable()
export class RevenueService {
  private readonly logger = new Logger(RevenueService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  /**
   * GET /admin/revenue
   * Gross revenue, total commission, total seller payables, breakdown by gateway.
   */
  async getRevenueSummary() {
    const completedStatuses = [
      OrderStatus.PAID,
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CONFIRMED,
    ];

    // Overall totals
    const totals = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('SUM(o.amountPaid)', 'grossRevenue')
      .addSelect('SUM(o.commissionAmount)', 'totalCommission')
      .addSelect('SUM(o.sellerEarnings)', 'totalSellerPayables')
      .addSelect('COUNT(o.id)', 'totalOrders')
      .getRawOne();
    const typedTotals: RevenueTotalsResult | undefined = totals;

    // Breakdown by gateway
    const byGateway = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('o.paymentGateway', 'gateway')
      .addSelect('SUM(o.amountPaid)', 'grossRevenue')
      .addSelect('SUM(o.commissionAmount)', 'commission')
      .addSelect('COUNT(o.id)', 'orderCount')
      .groupBy('o.paymentGateway')
      .getRawMany();
    const typedByGateway: RevenueByGatewayResult[] = byGateway;

    return {
      grossRevenue: Number(typedTotals?.grossRevenue || 0),
      totalCommission: Number(typedTotals?.totalCommission || 0),
      totalSellerPayables: Number(typedTotals?.totalSellerPayables || 0),
      totalOrders: Number(typedTotals?.totalOrders || 0),
      byGateway: typedByGateway.map((g) => ({
        gateway: g.gateway,
        grossRevenue: Number(g.grossRevenue || 0),
        commission: Number(g.commission || 0),
        orderCount: Number(g.orderCount || 0),
      })),
    };
  }

  /**
   * GET /admin/revenue/transactions
   * Paginated transaction table.
   */
  async getRevenueTransactions(page = 1, limit = 20) {
    const completedStatuses = [
      OrderStatus.PAID,
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CONFIRMED,
      OrderStatus.REFUNDED,
    ];

    const [orders, total] = await this.orderRepo.findAndCount({
      where: completedStatuses.map((s) => ({ status: s })),
      relations: ['buyer', 'seller', 'product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: toPlain(
        orders.map((o) => ({
          id: o.id,
          buyerEmail: o.buyer?.email || 'N/A',
          productTitle: o.product?.title || 'N/A',
          amountPaid: Number(o.amountPaid),
          commissionAmount: Number(o.commissionAmount),
          sellerEarnings: Number(o.sellerEarnings),
          currency: o.currency,
          paymentGateway: o.paymentGateway,
          paymentRef: o.paymentRef,
          status: o.status,
          createdAt: o.createdAt,
        })),
      ),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * GET /admin/revenue/summary
   * Monthly/weekly revenue time-series for charts.
   */
  async getRevenueTimeSeries(period: 'weekly' | 'monthly' = 'monthly') {
    const completedStatuses = [
      OrderStatus.PAID,
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CONFIRMED,
    ];

    const dateTrunc = period === 'weekly' ? 'week' : 'month';

    const data = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select(`DATE_TRUNC('${dateTrunc}', o.createdAt)`, 'period')
      .addSelect('SUM(o.amountPaid)', 'grossRevenue')
      .addSelect('SUM(o.commissionAmount)', 'commission')
      .addSelect('COUNT(o.id)', 'orderCount')
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();
    const typedData: RevenueTimeSeriesResult[] = data;

    return {
      period,
      data: typedData.map((d) => ({
        period: d.period,
        grossRevenue: Number(d.grossRevenue || 0),
        commission: Number(d.commission || 0),
        orderCount: Number(d.orderCount || 0),
      })),
    };
  }

  /**
   * GET /admin/commission/summary
   * Total earned, per category breakdown, per seller breakdown.
   */
  async getCommissionSummary() {
    const completedStatuses = [
      OrderStatus.PAID,
      OrderStatus.COMPLETED,
      OrderStatus.DELIVERED,
      OrderStatus.CONFIRMED,
    ];

    const totalEarned = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('SUM(o.commissionAmount)', 'total')
      .getRawOne();
    const typedTotalEarned: CommissionTotalResult | undefined = totalEarned;

    // In a full implementation, categories would come from the product.
    // Assuming product has a category string.
    const perCategory = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.product', 'p')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('p.category', 'category')
      .addSelect('SUM(o.commissionAmount)', 'commission')
      .groupBy('p.category')
      .getRawMany();
    const typedPerCategory: CommissionByCategoryResult[] = perCategory;

    const perSeller = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoin('o.seller', 's')
      .where('o.status IN (:...statuses)', { statuses: completedStatuses })
      .select('s.id', 'sellerId')
      .addSelect('s.email', 'email')
      .addSelect('SUM(o.commissionAmount)', 'commission')
      .groupBy('s.id')
      .addGroupBy('s.email')
      .orderBy('"commission"', 'DESC')
      .limit(20)
      .getRawMany();
    const typedPerSeller: CommissionBySellerResult[] = perSeller;

    return {
      totalEarned: Number(typedTotalEarned?.total || 0),
      perCategory: typedPerCategory.map((c) => ({
        category: c.category || 'Uncategorized',
        commission: Number(c.commission || 0),
      })),
      perSeller: typedPerSeller.map((s) => ({
        sellerId: s.sellerId,
        email: s.email,
        commission: Number(s.commission || 0),
      })),
    };
  }

  /**
   * Mock implementation for revenue reconciliation against gateway logs.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async reconcileRevenue(gateway: string, startDate: string, endDate: string) {
    // In reality, this would fetch from Stripe/Flutterwave/Paystack API
    // and compare against our local order records.
    this.logger.log(
      `Reconciling revenue for ${gateway} from ${startDate} to ${endDate}`,
    );
    return {
      success: true,
      message: `Reconciliation simulated for ${gateway}`,
      discrepanciesFound: 0,
      details: 'All local records match gateway logs (simulated).',
    };
  }
}
