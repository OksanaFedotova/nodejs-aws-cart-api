import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  Post,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth';
import { OrderService } from '../order/services';
import { AppRequest, getUserIdFromRequest } from '../shared';

import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { Cart } from './models';
import { CartStatus } from 'src/database/entities/cart.entity';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findOrCreateByUserId(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: { cart, total: calculateCartTotal(cart) },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUserCart(@Req() req: AppRequest, @Body() body) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.updateByUserId(userId, body) as unknown as Cart;
    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
      data: {
        cart,
        total: calculateCartTotal(cart),
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async clearUserCart(@Req() req: AppRequest) {
    const userId = getUserIdFromRequest(req);
    await this.cartService.removeByUserId(userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'OK',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Req() req: AppRequest, @Body() body) {
    const userId = getUserIdFromRequest(req);

    const queryRunner = this.cartService.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartService.findByUserId(userId);
      if (!(cart)) {
        await queryRunner.rollbackTransaction();
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Cart is empty',
        };
      }

      const { id: cartId, items } = cart;
      const total = calculateCartTotal(cart);

      const order = await this.orderService.createOrder(
        {
          ...body,
          userId,
          cartId,
          items,
          total,
        },
        queryRunner,
      );

      cart.status = CartStatus.ORDERED;
      await this.cartService.updateCartStatus(cartId, CartStatus.ORDERED, queryRunner);

      // await this.cartService.removeByUserId(userId);

      await queryRunner.commitTransaction();

      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: { order },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
