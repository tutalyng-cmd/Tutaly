import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ShopService } from './src/modules/shop/shop.service';
import { RatingsDisputesEarningsService } from './src/modules/shop/services/ratings-disputes-earnings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus } from './src/modules/shop/entities/order.entity';
import { Repository } from 'typeorm';

import { ShopProduct, ListingType, ShopCategory, ShopSubcategory, PricingType } from './src/modules/shop/entities/shop.entity';
import { User } from './src/modules/user/entities/user.entity';

async function bootstrap() {
  console.log('Bootstrapping application...');
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const shopService = app.get(ShopService);
  const disputeService = app.get(RatingsDisputesEarningsService);
  const orderRepo = app.get<Repository<Order>>(getRepositoryToken(Order));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const productRepo = app.get<Repository<ShopProduct>>(getRepositoryToken(ShopProduct));
  const categoryRepo = app.get<Repository<ShopCategory>>(getRepositoryToken(ShopCategory));
  const subcategoryRepo = app.get<Repository<ShopSubcategory>>(getRepositoryToken(ShopSubcategory));

  const dummyUser = await orderRepo.manager.findOne('User', { where: {} });
  if (!dummyUser) throw new Error('No user found in DB');
  const userId = dummyUser.id;

  const dummyProduct = await orderRepo.manager.findOne('ShopProduct', { where: {} });
  if (!dummyProduct) throw new Error('No product found in DB');
  const prodId = dummyProduct.id;

  const pastDate = new Date(Date.now() - 100000).toISOString();
  const orderResult = await orderRepo.query(
    `INSERT INTO orders ("buyerId", "sellerId", "productId", "amountPaid", "commissionAmount", "sellerEarnings", "status", "escrowReleaseAt", "quantity", "downloadCount") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, 0) RETURNING id`,
    [userId, userId, prodId, 100, 20, 80, 'paid', pastDate]
  );
  const orderId = orderResult[0].id;

  const order = await orderRepo.findOne({
    where: { id: orderId },
    relations: ['buyer', 'product']
  });
  console.log(`Prepared Order: ${order!.id}`);

  console.log('Testing lock behavior...');

  // Mock manager.findOne to sleep for 3 seconds if inside a transaction with pessimistic_write lock
  const originalFindOne = orderRepo.manager.findOne.bind(orderRepo.manager);
  orderRepo.manager.findOne = async (...args: any[]) => {
    const result = await originalFindOne(...args);
    // Add delay specifically for the createDispute transaction to simulate race condition
    if (args[1]?.lock?.mode === 'pessimistic_write') {
      console.log('[Mock] Pessimistic lock acquired! Sleeping for 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('[Mock] Waking up after 3 seconds!');
    }
    return result;
  };

  const createDisputePromise = disputeService.createDispute(order!.id, order!.buyer.id, {
    reason: 'Testing race condition lock',
    evidenceUrls: []
  }).catch(e => console.error('CreateDispute Error:', e.message));

  // Wait just 500ms so createDispute definitely acquires the lock first
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('Starting autoReleaseExpiredEscrows while dispute creation holds the lock...');
  const autoReleasePromise = shopService.autoReleaseExpiredEscrows().then((res: any) => {
     console.log('AutoRelease finished. Released count:', res?.released);
  }).catch(e => console.error('AutoRelease Error:', e.message));

  await Promise.all([createDisputePromise, autoReleasePromise]);

  const updatedOrder = await orderRepo.findOne({ where: { id: order!.id } });
  console.log('Final Order Status:', updatedOrder?.status);

  if (updatedOrder?.status === OrderStatus.FLAGGED) {
    console.log('SUCCESS! The lock prevented autoRelease from overwriting the dispute.');
  } else {
    console.log('FAILURE! Race condition allowed autoRelease to overwrite dispute.');
  }

  await app.close();
}

bootstrap();
