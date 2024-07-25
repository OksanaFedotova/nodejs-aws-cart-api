import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { Cart as CartEntity, CartStatus } from '../../database/entities/cart.entity';
import { CartItem as CartItemEntity } from '../../database/entities/cart-item.entity';
import { Cart } from '../models';
import { CartDto, UpdateCartDto } from '../dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    readonly dataSource: DataSource,
  ) {}
  
 async findByUserId(userId: string): Promise<CartEntity | null> {
  const cartOpen = await this.cartRepository.createQueryBuilder('cart')
    .where('cart.user_id = :userId', { userId })
    .andWhere('cart.status = :status', { status: CartStatus.OPEN })
    .getOne();
  if (!cartOpen) {
    return null
  }
  const cartItems = await this.cartItemRepository.createQueryBuilder('cart_item')
    .where('cart_item.cart_id = :cartId', { cartId: cartOpen.id })
    .getMany();

  cartOpen.items = cartItems;

  return cartOpen;
}


  async createByUserId(userId: string): Promise<CartEntity> {
    const newCart = this.cartRepository.create({
      user_id: userId,
      status: CartStatus.OPEN,
    });
    await this.cartRepository.save(newCart);
    return newCart;
  }

  async findOrCreateByUserId(userId: string): Promise<CartEntity> {
    let cart = await this.findByUserId(userId);
    if (cart) {
      return cart;
    }
    return await this.createByUserId(userId);
  }

async updateByUserId(userId: string, updateCartDto: UpdateCartDto): Promise<CartEntity & { items: CartItemEntity[] }> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    const existingCart = await this.findOrCreateByUserId(userId);

    const newItems = updateCartDto.items.map(itemDto => ({
      product_id: itemDto.product_id,
      count: itemDto.count,
      cart_id: existingCart.id
    }));

    const existingItems = await queryRunner.manager.find(CartItemEntity, { where: { cart_id: existingCart.id } });


    const itemMap = new Map<string, number>();

    for (const existingItem of existingItems) {
      itemMap.set(existingItem.product_id, existingItem.count);
    }

    for (const newItem of newItems) {
      const currentCount = itemMap.get(newItem.product_id) || 0;
      itemMap.set(newItem.product_id, currentCount + newItem.count);
    }

    const itemsToSave: CartItemEntity[] = [];
    const itemsToRemove: CartItemEntity[] = [];

    for (const [product_id, count] of itemMap) {
      if (count > 0) {
        const existingItem = existingItems.find(item => item.product_id === product_id);
        if (existingItem) {
          existingItem.count = count;
          itemsToSave.push(existingItem);
        } else {
          const newCartItem = this.cartItemRepository.create({
            product_id,
            count,
            cart_id: existingCart.id
          });
          itemsToSave.push(newCartItem);
        }
      } else {

        const itemToRemove = existingItems.find(item => item.product_id === product_id);
        if (itemToRemove) {
          itemsToRemove.push(itemToRemove);
        }
      }
    }

    const itemsToRemoveFromCart = existingItems.filter(item => !itemMap.has(item.product_id));
    if (itemsToRemoveFromCart.length > 0) {
      await queryRunner.manager.remove(CartItemEntity, itemsToRemoveFromCart);
    }
    if (itemsToRemove.length > 0) {
      await queryRunner.manager.remove(CartItemEntity, itemsToRemove);
    }

    await queryRunner.manager.save(CartItemEntity, itemsToSave);

    await queryRunner.commitTransaction();

    const updatedItems = await queryRunner.manager.find(CartItemEntity, { where: { cart_id: existingCart.id } });

    return { ...existingCart, items: updatedItems };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
   



  async removeByUserId(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const cart = await this.findByUserId(userId)
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      await queryRunner.manager.remove(CartItemEntity, cart.items);
      await queryRunner.manager.remove(CartEntity, cart);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
    async updateCartStatus(cartId: string, status: CartStatus, queryRunner: QueryRunner): Promise<void> {
    const cart = await queryRunner.manager.findOne(CartEntity, {
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.status = status;
    await queryRunner.manager.save(cart);
  }
}
