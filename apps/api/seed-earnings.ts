import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from './src/modules/user/entities/user.entity';
import { SellerProfile } from './src/modules/shop/entities/seller-profile.entity';
import { Order, OrderStatus } from './src/modules/shop/entities/order.entity';
import { ShopProduct, Currency } from './src/modules/shop/entities/shop.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const userRepo = dataSource.getRepository(User);
  const sellerRepo = dataSource.getRepository(SellerProfile);
  const orderRepo = dataSource.getRepository(Order);
  const productRepo = dataSource.getRepository(ShopProduct);

  const email = 'seller_test@tutaly.com';
  let user = await userRepo.findOne({ where: { email }, relations: ['sellerProfile'] });

  if (!user) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    user = userRepo.create({
      email,
      password: hashedPassword,
      role: UserRole.EMPLOYER,
      isActive: true
    });
    user = await userRepo.save(user);

    const sellerProfile = sellerRepo.create({
      user: user,
      shopName: 'Test Shop',
    } as any);
    await sellerRepo.save(sellerProfile);
    
    user = await userRepo.findOne({ where: { email }, relations: ['sellerProfile'] });
  }

  let product = await productRepo.findOne({ where: { seller: { id: user!.id } } }) as any;
  if (!product) {
    product = productRepo.create({
      title: 'Test Product',
      description: 'A test product',
      price: 10000,
      currency: Currency.NGN,
      stock: 10,
      seller: user as any,
      isDigital: true
    });
    product = await productRepo.save(product as any);
  }

  await orderRepo.delete({ seller: { id: user!.id } });

  const order1 = orderRepo.create({
    buyer: user!,
    product: product,
    seller: user!,
    amountPaid: 10000,
    commissionAmount: 2000,
    sellerEarnings: 8000,
    status: OrderStatus.COMPLETED
  } as any);

  const order2 = orderRepo.create({
    buyer: user!,
    product: product,
    seller: user!,
    amountPaid: 5000,
    commissionAmount: 1000,
    sellerEarnings: 4000,
    status: OrderStatus.DELIVERED
  } as any);

  const order3 = orderRepo.create({
    buyer: user!,
    product: product,
    seller: user!,
    amountPaid: 20000,
    commissionAmount: 4000,
    sellerEarnings: 16000,
    status: OrderStatus.PAID
  } as any);

  await orderRepo.save([order1, order2, order3] as any);
  console.log('Seed completed. Email: seller_test@tutaly.com Password: password123');
  await app.close();
  process.exit(0);
}

bootstrap();
