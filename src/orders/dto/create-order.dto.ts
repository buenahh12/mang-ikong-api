import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// One line of the order: which dish and how many
export class OrderItemInputDto {
  @IsInt()
  @IsPositive()
  itemId: number;

  @IsInt()
  @Min(1, { message: 'quantity must be at least 1' })
  @Max(100, { message: 'quantity cannot be more than 100' })
  quantity: number;
}

// Body for POST /orders → { "items": [ { "itemId": 1, "quantity": 2 } ] }
// The customer never sends prices: the server looks them up.
export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'an order needs at least 1 item' })
  @ArrayMaxSize(50)
  @ValidateNested({ each: true }) // check every item with OrderItemInputDto's rules
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}
