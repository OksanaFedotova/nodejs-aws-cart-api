import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  userId: string;

  @IsObject()
  payment: any;

  @IsObject()
  delivery: any;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsNotEmpty()
  cartId: string;

  @IsNotEmpty()
  total: number;
}
