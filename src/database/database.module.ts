import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Order } from './entities/order.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Cart, CartItem, Order, User],
      synchronize: false,
      logging: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    TypeOrmModule.forFeature([Cart, CartItem]),
  ],
})
export class DatabaseModule {}
