import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/decimal.transformer';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';
import { Order } from './order.entity';

// Junction table: links orders to menu_items
@Entity('order_items')
@Check('chk_order_items_quantity', '`quantity` > 0')
export class OrderItem {
  @PrimaryGeneratedColumn({ name: 'order_item_id' })
  orderItemId: number;

  // many order items → 1 order (deleting an order deletes its items)
  @ManyToOne(() => Order, (order) => order.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // many order items → 1 menu item (a menu item that was ordered can't be deleted)
  @ManyToOne(() => MenuItem, (menuItem) => menuItem.orderItems, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'item_id' })
  menuItem: MenuItem;

  @Column({ type: 'int' })
  quantity: number;

  // price × quantity at the time of ordering
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  subtotal: number;
}
