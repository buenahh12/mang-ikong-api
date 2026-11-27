import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  // MenuItem is included so the service can look up real prices
  imports: [TypeOrmModule.forFeature([Order, OrderItem, MenuItem])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
