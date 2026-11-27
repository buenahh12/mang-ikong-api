import { Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../../common/decimal.transformer';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('menu_items')
@Check('chk_menu_items_price', '`price` > 0')
export class MenuItem {
  @PrimaryGeneratedColumn({ name: 'item_id' })
  itemId: number;

  @Column({ name: 'item_name', length: 100 })
  itemName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  price: number;

  @Column({ length: 50 })
  category: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  // 1 menu item → many order items
  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  orderItems: OrderItem[];
}
