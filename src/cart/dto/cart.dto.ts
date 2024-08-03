import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CartStatus } from 'src/database/entities/cart.entity';


export class CartItemDto {
  @IsString()
  product_id: string; 
  @IsNumber()
  count: number;
}
export type UpdateCartDto = {
  items: {
    product_id: string;
    count: number;
  }[];
};
export class CartDto {
  @IsString()
  id: string;

  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  created_at?: string;

  @IsOptional()
  @IsString()
  updated_at?: string;

  @IsOptional()
  @IsEnum(CartStatus)
  status?: CartStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
