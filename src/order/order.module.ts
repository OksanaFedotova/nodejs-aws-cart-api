import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from 'src/database/entities/cart.entity';
import { Order } from 'src/database/entities/order.entity';
import { OrderController } from './order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart])],
  providers: [OrderService],
  exports: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
