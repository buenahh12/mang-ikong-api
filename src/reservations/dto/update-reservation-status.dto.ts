import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../entities/table-reservation.entity';

// Body for PATCH /reservations/:id/status → { "status": "confirmed" }
export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus, {
    message: 'status must be pending, confirmed or cancelled',
  })
  status: ReservationStatus;
}
