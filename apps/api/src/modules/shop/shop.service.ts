import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import {
  ShopProduct,
  ShopCategory,
  ShopSubcategory,
  Currency,
  ListingType,
} from './entities/shop.entity';
import { Order, OrderStatus, PaymentGateway } from './entities/order.entity';
import { User, SellerStatus } from '../user/entities/user.entity';
import {
  SellerApplication,
  SellerApplicationStatus,
} from '../support/entities/support.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { TokenService } from '../auth/token.service';

@Injectable()
export class ShopService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectRepository(ShopProduct)
    private readonly productRepo: Repository<ShopProduct>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(SellerApplication)
    private readonly sellerAppRepo: Repository<SellerApplication>,
    @InjectRepository(ShopCategory)
    private readonly categoryRepo: Repository<ShopCategory>,
    @InjectRepository(ShopSubcategory)
    private readonly subcategoryRepo: Repository<ShopSubcategory>,
    private readonly tokenService: TokenService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || '',
    );
  }

  // ─── Seller Application Flow ──────────────────────────────────────

  async applySeller(userId: string, dto: ApplySellerDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.sellerStatus === SellerStatus.APPROVED) {
      throw new BadRequestException('You are already an approved seller.');
    }
    if (user.sellerStatus === SellerStatus.PENDING) {
      throw new BadRequestException(
        'Your seller application is already pending review.',
      );
    }

    // Check for existing pending application
    const existing = await this.sellerAppRepo.findOne({
      where: { user: { id: userId }, status: SellerApplicationStatus.PENDING },
    });
    if (existing) {
      throw new BadRequestException('You already have a pending application.');
    }

    const application = this.sellerAppRepo.create({
      user: { id: userId } as any,
      bio: dto.bio,
      categoryFocus: dto.categoryFocus,
      status: SellerApplicationStatus.PENDING,
    });

    await this.sellerAppRepo.save(application);

    // Update user status
    user.sellerStatus = SellerStatus.PENDING;
    await this.userRepo.save(user);

    return {
      success: true,
      message: 'Seller application submitted. Awaiting admin review.',
    };
  }

  async getSellerStatus(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { sellerStatus: user.sellerStatus };
  }

  async adminUpdateSellerApplication(
    applicationId: string,
    status: SellerApplicationStatus,
    adminId: string,
  ) {
    const application = await this.sellerAppRepo.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });
    if (!application) throw new NotFoundException('Application not found');

    application.status = status;
    application.reviewedBy = { id: adminId } as any;
    await this.sellerAppRepo.save(application);

    // Update user's sellerStatus
    const user = application.user;
    if (status === SellerApplicationStatus.APPROVED) {
      user.sellerStatus = SellerStatus.APPROVED;
    } else if (status === SellerApplicationStatus.REJECTED) {
      user.sellerStatus = SellerStatus.REJECTED;
    }
    await this.userRepo.save(user);

    return { success: true, message: `Seller application ${status}.` };
  }

  async getPendingSellerApplications(page = 1, limit = 10) {
    const [data, total] = await this.sellerAppRepo.findAndCount({
      where: { status: SellerApplicationStatus.PENDING },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { items: data, meta: { page, limit, total } };
  }

  // ─── Product CRUD ──────────────────────────────────────────────────

  async createProduct(userId: string, dto: CreateProductDto) {
    const subcategory = await this.subcategoryRepo.findOne({
      where: { id: dto.subcategoryId },
    });
    if (!subcategory) throw new BadRequestException('Invalid subcategory.');

    if (!dto.isWorkRelatedConfirmed) {
      throw new BadRequestException(
        'You must confirm this listing is work-related.',
      );
    }

    const product = this.productRepo.create({
      seller: { id: userId } as any,
      title: dto.title,
      description: dto.description,
      listingType: dto.listingType,
      subcategory,
      pricingType: dto.pricingType,
      price: dto.price,
      currency: dto.currency || Currency.NGN,
      priceUnit: dto.priceUnit,
      minQuantity: dto.minQuantity || 1,
      priceMayVary: dto.priceMayVary || false,
      imageUrls: dto.imageUrls || [],
      isWorkRelatedConfirmed: true,
    });

    await this.productRepo.save(product);
    return { success: true, data: product };
  }

  async updateProduct(
    productId: string,
    userId: string,
    dto: Partial<CreateProductDto>,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller.id !== userId)
      throw new ForbiddenException('You can only edit your own listings.');

    Object.assign(product, dto);
    await this.productRepo.save(product);
    return { success: true, data: product };
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller.id !== userId)
      throw new ForbiddenException('You can only delete your own listings.');

    product.isActive = false;
    await this.productRepo.save(product);
    return { success: true, message: 'Product deactivated.' };
  }

  async getProducts(
    page = 1,
    limit = 12,
    search?: string,
    listingType?: string,
    subcategoryId?: string,
  ) {
    const query = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('product.subcategory', 'subcategory')
      .where('product.isActive = :isActive', { isActive: true });

    if (search) {
      query.andWhere(
        '(LOWER(product.title) LIKE :search OR LOWER(product.description) LIKE :search)',
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }
    if (listingType) {
      query.andWhere('product.listingType = :listingType', { listingType });
    }
    if (subcategoryId) {
      query.andWhere('product.subcategory.id = :subcategoryId', {
        subcategoryId,
      });
    }

    query
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    const [data, total] = await query.getManyAndCount();
    return { data, meta: { page, limit, total } };
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id, isActive: true },
      relations: ['seller', 'subcategory', 'subcategory.category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getSellerProducts(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.productRepo.findAndCount({
      where: { seller: { id: userId } },
      relations: ['subcategory'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, meta: { page, limit, total } };
  }

  // ─── Digital File Upload ──────────────────────────────────────────

  async uploadDigitalFile(
    productId: string,
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller.id !== userId)
      throw new ForbiddenException('Not your product.');

    const ext = originalName.split('.').pop() || 'bin';
    const key = `digital-products/${productId}/${Date.now()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from('digital-products')
      .upload(key, fileBuffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) throw new BadRequestException(`Upload failed: ${error.message}`);

    product.fileS3Key = data.path;
    await this.productRepo.save(product);

    return {
      success: true,
      message: 'Digital file uploaded to private storage.',
    };
  }

  // ─── Product Image Upload ─────────────────────────────────────────

  async uploadProductImage(
    productId: string,
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller.id !== userId)
      throw new ForbiddenException('Not your product.');

    const ext = originalName.split('.').pop() || 'jpg';
    const key = `product-images/${productId}/${Date.now()}.${ext}`;

    const { data, error } = await this.supabase.storage
      .from('product-images')
      .upload(key, fileBuffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException(`Upload failed: ${error.message}`);

    // Get the public URL for the uploaded image
    const { data: urlData } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    const imageUrl = urlData.publicUrl;

    // Append to existing images array
    if (!product.imageUrls) {
      product.imageUrls = [];
    }
    product.imageUrls.push(imageUrl);
    await this.productRepo.save(product);

    return {
      success: true,
      imageUrl,
      message: 'Product image uploaded successfully.',
    };
  }

  // ─── Cart (Redis-backed) ──────────────────────────────────────────

  private cartKey(userId: string) {
    return `cart:${userId}`;
  }

  async getCart(userId: string) {
    const raw = await this.tokenService.getJobCache(this.cartKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as Array<{ productId: string; quantity: number }>;
  }

  async addToCart(userId: string, productId: string, quantity = 1) {
    const cart = await this.getCart(userId);
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    await this.tokenService.setJobCache(
      this.cartKey(userId),
      JSON.stringify(cart),
      86400,
    ); // 24hr TTL
    return cart;
  }

  async removeFromCart(userId: string, productId: string) {
    let cart = await this.getCart(userId);
    cart = cart.filter((item) => item.productId !== productId);
    await this.tokenService.setJobCache(
      this.cartKey(userId),
      JSON.stringify(cart),
      86400,
    );
    return cart;
  }

  // ─── Checkout (Dual Gateway: Flutterwave + Paystack) ───────────────

  async createCheckout(
    userId: string,
    gateway: PaymentGateway = PaymentGateway.FLUTTERWAVE,
  ) {
    const cart = await this.getCart(userId);
    if (cart.length === 0) throw new BadRequestException('Your cart is empty.');

    const orders: Order[] = [];

    for (const item of cart) {
      const product = await this.productRepo.findOne({
        where: { id: item.productId, isActive: true },
        relations: ['seller'],
      });
      if (!product)
        throw new BadRequestException(
          `Product ${item.productId} not found or inactive.`,
        );
      if (product.seller.id === userId)
        throw new BadRequestException('You cannot buy your own product.');

      const amountPaid = Number(product.price) * item.quantity;
      const commissionAmount = amountPaid * 0.2;
      const sellerEarnings = amountPaid - commissionAmount;

      const paymentRef = `TUT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      const order = this.orderRepo.create({
        buyer: { id: userId } as any,
        product,
        seller: product.seller,
        amountPaid,
        commissionAmount,
        sellerEarnings,
        currency: product.currency || Currency.NGN,
        paymentGateway: gateway,
        paymentRef,
        status: OrderStatus.PENDING_PAYMENT,
      });

      orders.push(await this.orderRepo.save(order));
    }

    const totalAmount = orders.reduce(
      (sum, o) => sum + Number(o.amountPaid),
      0,
    );
    const buyer = await this.userRepo.findOne({ where: { id: userId } });
    const currency = orders[0]?.currency || Currency.NGN;
    const reference =
      orders.length === 1 ? orders[0].paymentRef : `TUT-BATCH-${Date.now()}`;

    // Route to the selected payment gateway
    if (gateway === PaymentGateway.PAYSTACK) {
      return this.initPaystackPayment(
        orders,
        totalAmount,
        currency,
        reference,
        buyer,
        userId,
      );
    }
    return this.initFlutterwavePayment(
      orders,
      totalAmount,
      currency,
      reference,
      buyer,
      userId,
    );
  }

  // ─── Flutterwave Payment Init ─────────────────────────────────────

  private async initFlutterwavePayment(
    orders: Order[],
    totalAmount: number,
    currency: Currency,
    reference: string,
    buyer: User | null,
    userId: string,
  ) {
    const flutterwavePayload = {
      tx_ref: reference,
      amount: totalAmount, // Flutterwave accepts major currency units — no conversion needed
      currency: currency,
      redirect_url: `${process.env.WEB_URL || 'http://localhost:3000'}/shop/checkout/success`,
      customer: {
        email: buyer?.email || 'buyer@tutaly.com',
        name: buyer?.email ? buyer.email.split('@')[0] : 'Tutaly Buyer',
      },
      meta: {
        order_ids: orders.map((o) => o.id).join(','),
        payment_refs: orders.map((o) => o.paymentRef).join(','),
      },
      customizations: {
        title: 'Tutaly Shop',
        description: `Payment for ${orders.length} item(s)`,
      },
    };

    try {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTER_WAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flutterwavePayload),
      });

      const result = await response.json();

      if (result.status === 'success') {
        await this.tokenService.setJobCache(this.cartKey(userId), '[]', 1);
        return {
          success: true,
          gateway: 'flutterwave',
          paymentLink: result.data.link,
          orders: orders.map((o) => ({
            id: o.id,
            paymentRef: o.paymentRef,
            amount: o.amountPaid,
            currency: o.currency,
          })),
        };
      } else {
        throw new BadRequestException(`Flutterwave error: ${result.message}`);
      }
    } catch {
      await this.tokenService.setJobCache(this.cartKey(userId), '[]', 1);
      return {
        success: true,
        gateway: 'flutterwave',
        paymentLink: null,
        message:
          'Orders created. Flutterwave payment link could not be generated (check API keys).',
        orders: orders.map((o) => ({
          id: o.id,
          paymentRef: o.paymentRef,
          amount: o.amountPaid,
          currency: o.currency,
        })),
      };
    }
  }

  // ─── Paystack Payment Init ────────────────────────────────────────

  private async initPaystackPayment(
    orders: Order[],
    totalAmount: number,
    currency: Currency,
    reference: string,
    buyer: User | null,
    userId: string,
  ) {
    // Paystack requires amount in the smallest currency unit:
    // NGN → kobo (*100), USD → cents (*100), EUR → cents (*100)
    const paystackAmount = Math.round(totalAmount * 100);

    const paystackPayload = {
      reference,
      amount: paystackAmount,
      currency: currency, // Paystack supports NGN, USD, EUR, GHS
      email: buyer?.email || 'buyer@tutaly.com',
      callback_url: `${process.env.WEB_URL || 'http://localhost:3000'}/shop/checkout/success`,
      metadata: {
        order_ids: orders.map((o) => o.id).join(','),
        payment_refs: orders.map((o) => o.paymentRef).join(','),
      },
    };

    try {
      const response = await fetch(
        'https://api.paystack.co/transaction/initialize',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paystackPayload),
        },
      );

      const result = await response.json();

      if (result.status === true) {
        await this.tokenService.setJobCache(this.cartKey(userId), '[]', 1);
        return {
          success: true,
          gateway: 'paystack',
          paymentLink: result.data.authorization_url,
          orders: orders.map((o) => ({
            id: o.id,
            paymentRef: o.paymentRef,
            amount: o.amountPaid,
            currency: o.currency,
          })),
        };
      } else {
        throw new BadRequestException(`Paystack error: ${result.message}`);
      }
    } catch {
      await this.tokenService.setJobCache(this.cartKey(userId), '[]', 1);
      return {
        success: true,
        gateway: 'paystack',
        paymentLink: null,
        message:
          'Orders created. Paystack payment link could not be generated (check API keys).',
        orders: orders.map((o) => ({
          id: o.id,
          paymentRef: o.paymentRef,
          amount: o.amountPaid,
          currency: o.currency,
        })),
      };
    }
  }

  // ─── Flutterwave Webhook ──────────────────────────────────────────

  async handleFlutterwaveWebhook(
    payload: Record<string, any>,
    verifHash: string,
  ) {
    const secretHash = process.env.FLUTTER_WAVE_ENCRYPTION_KEY || '';
    if (verifHash !== secretHash) {
      throw new ForbiddenException('Invalid webhook signature.');
    }

    const { event, data } = payload;
    if (event === 'charge.completed' && data.status === 'successful') {
      await this.processSuccessfulPayment(data.tx_ref, data.meta);
    }

    return { success: true };
  }

  // ─── Paystack Webhook ─────────────────────────────────────────────

  async handlePaystackWebhook(payload: Record<string, any>, signature: string) {
    // HMAC-SHA512 verification
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new ForbiddenException('Invalid webhook signature.');
    }

    const { event, data } = payload;
    if (event === 'charge.success' && data.status === 'success') {
      await this.processSuccessfulPayment(data.reference, data.metadata);
    }

    return { success: true };
  }

  // ─── Shared Payment Processing ────────────────────────────────────

  private async processSuccessfulPayment(
    txRef: string,
    meta: Record<string, any>,
  ) {
    const order = await this.orderRepo.findOne({
      where: { paymentRef: txRef },
      relations: ['product'],
    });

    if (!order) {
      // Batch order — check metadata for order IDs
      const orderIds = (meta?.order_ids || '').split(',').filter(Boolean);
      for (const orderId of orderIds) {
        const o = await this.orderRepo.findOne({
          where: { id: orderId.trim() },
          relations: ['product'],
        });
        if (o && o.status === OrderStatus.PENDING_PAYMENT) {
          if (o.product.listingType === ListingType.DIGITAL) {
            o.status = OrderStatus.COMPLETED;
            o.earningsReleasedAt = new Date();
          } else {
            o.status = OrderStatus.PAID;
          }
          await this.orderRepo.save(o);
        }
      }
    } else if (order.status === OrderStatus.PENDING_PAYMENT) {
      if (order.product.listingType === ListingType.DIGITAL) {
        order.status = OrderStatus.COMPLETED;
        order.earningsReleasedAt = new Date();
      } else {
        order.status = OrderStatus.PAID;
      }
      await this.orderRepo.save(order);
    }
  }

  // ─── Delivery & Escrow ──────────────────────────────────────────

  async markDelivered(orderId: string, sellerId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['seller'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.seller.id !== sellerId)
      throw new ForbiddenException('Not your order.');
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Order must be paid to mark as delivered.');
    }

    order.status = OrderStatus.DELIVERED;
    order.deliveredAt = new Date();
    // Auto-release window: 48 hours from delivery
    const releaseDate = new Date();
    releaseDate.setHours(releaseDate.getHours() + 48);
    order.escrowReleaseAt = releaseDate;

    await this.orderRepo.save(order);
    return {
      success: true,
      message:
        'Order marked as delivered. Buyer has 48 hours to confirm or report an issue.',
    };
  }

  async confirmDelivery(orderId: string, buyerId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['buyer'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyer.id !== buyerId)
      throw new ForbiddenException('Not your order.');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Order must be delivered to confirm.');
    }

    order.status = OrderStatus.COMPLETED;
    order.deliveryConfirmedAt = new Date();
    order.earningsReleasedAt = new Date();
    await this.orderRepo.save(order);

    return {
      success: true,
      message: 'Delivery confirmed. Funds released to seller.',
    };
  }

  async reportIssue(orderId: string, buyerId: string, reason: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['buyer'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyer.id !== buyerId)
      throw new ForbiddenException('Not your order.');

    // Can only report if paid or delivered, and not already completed/flagged
    if (![OrderStatus.PAID, OrderStatus.DELIVERED].includes(order.status)) {
      throw new BadRequestException(
        'Order status does not allow reporting at this stage.',
      );
    }

    order.status = OrderStatus.FLAGGED;
    // Pausing release by clearing the release date
    order.escrowReleaseAt = null;
    await this.orderRepo.save(order);

    this.logger.warn(
      `Order ${orderId} flagged by buyer ${buyerId}. Reason: ${reason}`,
    );

    return {
      success: true,
      message:
        'Issue reported. Order flagged for admin review and auto-release paused.',
    };
  }

  // Called by Bull cron job
  async autoReleaseExpiredEscrows() {
    const now = new Date();
    const expiredOrders = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.product', 'product')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAID, OrderStatus.DELIVERED],
      })
      .andWhere('order.escrowReleaseAt <= :now', { now })
      .getMany();

    for (const order of expiredOrders) {
      order.status = OrderStatus.COMPLETED;
      order.earningsReleasedAt = new Date();
      await this.orderRepo.save(order);
    }

    return { released: expiredOrders.length };
  }

  // ─── Signed Download URL ──────────────────────────────────────────

  async getDownloadUrl(orderId: string, buyerId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['buyer', 'product'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyer.id !== buyerId)
      throw new ForbiddenException('Not your order.');

    if (
      ![
        OrderStatus.PAID,
        OrderStatus.DELIVERED,
        OrderStatus.COMPLETED,
      ].includes(order.status)
    ) {
      throw new BadRequestException(
        'Payment must be completed before downloading.',
      );
    }

    if (!order.product.fileS3Key) {
      throw new BadRequestException(
        'This product does not have a downloadable file.',
      );
    }

    // Generate signed URL (1hr expiry)
    const { data, error } = await this.supabase.storage
      .from('digital-products')
      .createSignedUrl(order.product.fileS3Key, 3600);

    if (error)
      throw new BadRequestException(
        `Failed to generate download URL: ${error.message}`,
      );

    // Increment download count
    order.downloadCount += 1;
    await this.orderRepo.save(order);

    // Also increment product-level download count
    order.product.downloadCount += 1;
    await this.productRepo.save(order.product);

    return { success: true, downloadUrl: data.signedUrl, expiresIn: '1 hour' };
  }

  // ─── Order Queries ────────────────────────────────────────────────

  async getBuyerOrders(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { buyer: { id: userId } },
      relations: ['product', 'seller'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, meta: { page, limit, total } };
  }

  async getSellerOrders(userId: string, page = 1, limit = 10) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { seller: { id: userId } },
      relations: ['product', 'buyer'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, meta: { page, limit, total } };
  }

  // ─── Categories ───────────────────────────────────────────────────

  async getCategories() {
    return this.categoryRepo.find({ relations: ['subcategories'] });
  }
}
