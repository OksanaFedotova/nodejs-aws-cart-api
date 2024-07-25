import { Controller, Get, Post, Body, Param, Patch, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { Order } from '../database/entities/order.entity';
import { QueryRunner, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto';

@Controller('api/orders')
export class OrderController {
  private queryRunner: QueryRunner;

  constructor(
    private readonly orderService: OrderService,
    private readonly dataSource: DataSource,
  ) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();

    try {
      const order = await this.orderService.createOrder(createOrderDto, this.queryRunner);

      await this.queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await this.queryRunner.rollbackTransaction();
      throw new HttpException('Failed to create order', HttpStatus.BAD_REQUEST);
    } finally {
      await this.queryRunner.release();
    }
  }

  @Get()
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string): Promise<Order> {
  //   return this.orderService.findOne(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: Partial<Order>): Promise<Order> {
  //   return this.orderService.updateOrder(id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string): Promise<void> {
  //   return this.orderService.deleteOrder(id);
  // }
}

