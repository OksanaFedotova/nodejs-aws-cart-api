import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './cart.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => Cart, (cart) => cart.orders)
  cart: Cart;

  @Column({ type: 'json' })
  payment: {
    type: string;
    address?: any;
    creditCard?: any;
  };

  @Column({ type: 'json' })
  delivery: {
    type: string;
    address: any;
  };

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'numeric' })
  total: number;
}
