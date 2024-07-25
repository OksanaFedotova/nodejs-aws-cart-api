import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '../models';
import { InjectRepository } from '@nestjs/typeorm';
import { Order as OrderEntity, OrderStatus } from 'src/database/entities/order.entity';
import { QueryRunner, Repository } from 'typeorm';
import { Cart as CartEntity } from '../../database/entities/cart.entity';
import { CreateOrderDto } from '../dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
  ) {}

  async createOrder(
    orderData: CreateOrderDto,
    queryRunner: QueryRunner
  ): Promise<OrderEntity> {
   
    const cart = await queryRunner.manager.findOne(CartEntity, {
      where: { id: orderData.cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const order = this.orderRepository.create({
      userId: orderData.userId,
      cart,
      payment: orderData.payment,
      delivery: orderData.delivery,
      comments: orderData.comments,
      status: OrderStatus.PENDING, 
      total: orderData.total,
    });

    return queryRunner.manager.save(order);
  }

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      relations: ['cart', 'cart.items'],
    });
  }

  async findOne(id: string): Promise<OrderEntity> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['cart', 'cart.items'],
    });
  }

  async updateOrder(
    id: string,
    updateData: Partial<OrderEntity>
  ): Promise<OrderEntity> {
    await this.orderRepository.update(id, updateData);
    return this.findOne(id);
  }

  async deleteOrder(id: string): Promise<void> {
    await this.orderRepository.delete(id);
  }
}
