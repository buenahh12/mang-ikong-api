import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

// Optional filter for GET /orders?status=received (admin)
export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus, {
    message: 'status must be received, processing, completed or cancelled',
  })
  status?: OrderStatus;
}
