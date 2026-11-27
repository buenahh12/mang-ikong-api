import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

// Every orders route needs a login. RolesGuard only blocks routes marked @Roles(...)
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // POST /orders → place an order for the logged-in user
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  // GET /orders/my → the logged-in user's orders
  // (declared before ':id' so "my" isn't treated as an id)
  @Get('my')
  findMine(@CurrentUser() user: AuthUser) {
    return this.ordersService.findMine(user.userId);
  }

  // GET /orders → all orders (admin), optional ?status=received
  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  // GET /orders/:id → owner or admin
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.findOneFor(id, user);
  }

  // GET /orders/:id/items → owner or admin
  @Get(':id/items')
  findItems(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.findItemsFor(id, user);
  }

  // PATCH /orders/:id/status → admin moves the order along
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.orderStatus);
  }

  // DELETE /orders/:id → admin
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
