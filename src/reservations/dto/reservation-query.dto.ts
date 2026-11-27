import { IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from '../entities/table-reservation.entity';

// Optional filter for GET /reservations?status=pending (admin)
export class ReservationQueryDto {
  @IsOptional()
  @IsEnum(ReservationStatus, {
    message: 'status must be pending, confirmed or cancelled',
  })
  status?: ReservationStatus;
}
