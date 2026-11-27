import { IsEnum } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

// Body for PATCH /orders/:id/status → { "orderStatus": "processing" }
export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'orderStatus must be received, processing, completed or cancelled',
  })
  orderStatus: OrderStatus;
}
