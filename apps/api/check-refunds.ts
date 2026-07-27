import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from './src/modules/shop/entities/order.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const orderRepo = dataSource.getRepository(Order);
  
  const refundedOrders = await orderRepo.find({
    where: { status: OrderStatus.REFUNDED },
    relations: ['buyer', 'seller']
  });

  console.log(`Found ${refundedOrders.length} fake refunded orders.`);
  if (refundedOrders.length > 0) {
    for (const order of refundedOrders) {
      console.log(`- Order ID: ${order.id}, Amount: ${order.amountPaid} ${order.currency}, Buyer: ${order.buyer?.email}, Ref: ${order.paymentRef}`);
    }
  }

  await app.close();
  process.exit(0);
}

bootstrap();
