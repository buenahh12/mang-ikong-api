import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

// Work in centavos (whole numbers) so 0.1 + 0.2 problems can't happen
const toCents = (pesos: number) => Math.round(pesos * 100);
const toPesos = (cents: number) => cents / 100;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepository: Repository<MenuItem>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateOrderDto): Promise<Order> {
    // 1) Combine repeated dishes: [{1, x2}, {1, x1}] → {1, x3}
    const quantities = new Map<number, number>();
    for (const line of dto.items) {
      quantities.set(
        line.itemId,
        (quantities.get(line.itemId) ?? 0) + line.quantity,
      );
    }

    // 2) Load the real dishes from the database (never trust prices from the client)
    const ids = [...quantities.keys()];
    const menuItems = await this.menuItemsRepository.findBy({
      itemId: In(ids),
    });

    const missing = ids.filter((id) => !menuItems.some((m) => m.itemId === id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `Menu item(s) not found: ${missing.join(', ')}`,
      );
    }
    const soldOut = menuItems.filter((m) => !m.isAvailable);
    if (soldOut.length > 0) {
      throw new BadRequestException(
        `Not available right now: ${soldOut.map((m) => m.itemName).join(', ')}`,
      );
    }

    // 3) Compute each subtotal (price × quantity) and the order total
    let totalCents = 0;
    const orderItems = menuItems.map((menuItem) => {
      const quantity = quantities.get(menuItem.itemId)!;
      const subtotalCents = toCents(menuItem.price) * quantity;
      totalCents += subtotalCents;

      const orderItem = new OrderItem();
      orderItem.menuItem = menuItem;
      orderItem.quantity = quantity;
      orderItem.subtotal = toPesos(subtotalCents);
      return orderItem;
    });

    // 4) Save the order and all its items in ONE transaction:
    //    if anything fails, nothing is saved
    const order = new Order();
    order.user = { userId } as User;
    order.items = orderItems;
    order.totalAmount = toPesos(totalCents);
    order.orderStatus = OrderStatus.RECEIVED;

    const saved = await this.dataSource.transaction((manager) =>
      manager.save(order),
    );
    return this.loadOrder(saved.orderId);
  }

  // GET /orders/my
  findMine(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { userId } },
      relations: { items: { menuItem: true } },
      order: { orderDate: 'DESC', orderId: 'DESC' },
    });
  }

  // GET /orders (admin) — includes who placed each order
  findAll(query: OrderQueryDto): Promise<Order[]> {
    return this.ordersRepository.find({
      where: query.status ? { orderStatus: query.status } : {},
      relations: { user: true, items: { menuItem: true } },
      order: { orderDate: 'DESC', orderId: 'DESC' },
    });
  }

  // GET /orders/:id — customers may only see their own orders
  async findOneFor(orderId: number, requester: AuthUser): Promise<Order> {
    const order = await this.loadOrder(orderId);
    const isOwner = order.user.userId === requester.userId;
    if (!isOwner && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  // GET /orders/:id/items
  async findItemsFor(
    orderId: number,
    requester: AuthUser,
  ): Promise<OrderItem[]> {
    const order = await this.findOneFor(orderId, requester);
    return order.items;
  }

  // PATCH /orders/:id/status (admin)
  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.loadOrder(orderId);
    const finished = [OrderStatus.COMPLETED, OrderStatus.CANCELLED];
    if (finished.includes(order.orderStatus)) {
      throw new BadRequestException(
        `Order #${orderId} is already ${order.orderStatus} and can no longer change`,
      );
    }
    await this.ordersRepository.update({ orderId }, { orderStatus: status });
    return this.loadOrder(orderId);
  }

  // DELETE /orders/:id (admin) — its order_items are removed by ON DELETE CASCADE
  async remove(orderId: number): Promise<{ message: string }> {
    const order = await this.loadOrder(orderId);
    await this.ordersRepository.remove(order);
    return { message: `Order #${orderId} deleted` };
  }

  private async loadOrder(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { orderId },
      relations: { user: true, items: { menuItem: true } },
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    return order;
  }
}
