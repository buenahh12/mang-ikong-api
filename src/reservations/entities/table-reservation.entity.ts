import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('table_reservations')
@Check('chk_reservations_party_size', '`party_size` > 0')
export class TableReservation {
  @PrimaryGeneratedColumn({ name: 'reservation_id' })
  reservationId: number;

  // many reservations → 1 user (creates the user_id foreign key)
  @ManyToOne(() => User, (user) => user.reservations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'table_number', type: 'int' })
  tableNumber: number;

  @Column({ name: 'reservation_date', type: 'datetime' })
  reservationDate: Date;

  @Column({ name: 'party_size', type: 'int' })
  partySize: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;
}
