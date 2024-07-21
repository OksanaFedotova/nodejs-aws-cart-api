import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart as CartEntity } from '../../database/entities/cart.entity';
import { CartItem as CartItemEntity } from '../../database/entities/cart-item.entity';
import { v4 } from 'uuid';

import { Cart } from '../models';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
  ) {}

  findByUserId(userId: string): Cart {
    return this.userCarts[userId];
  }

  createByUserId(userId: string): Cart {
    const id = v4();
    const userCart = {
      id,
      user_id: userId,
      items: [],
    };

    this.userCarts[userId] = userCart;

    return userCart;
  }

  findOrCreateByUserId(userId: string): Cart {
    const userCart = this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, { items }: Cart): Cart {
    const { id, ...rest } = this.findOrCreateByUserId(userId);

    const updatedCart = {
      id,
      ...rest,
      items: [...items],
    };

    this.userCarts[userId] = { ...updatedCart };

    return { ...updatedCart };
  }

  removeByUserId(userId: string): void {
    this.userCarts[userId] = null;
  }

  async findAll(): Promise<Cart[]> {
    const carts = await this.cartRepository.find({ relations: ['items'] });
    return carts.map((cart) => ({
      id: cart.id,
      user_id: cart.user_id,
      created_at: cart.created_at?.toString(),
      updated_at: cart.updated_at?.toString(),
      status: cart.status,
      items: cart.items.map((item) => {
       return {
        product: {
            id: item.product_id,
  title: '',
  description: '',
  price: 0},
        count: item.count,
      }}),
    }));
  }
}
