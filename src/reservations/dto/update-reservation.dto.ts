import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

// Body for PATCH /reservations/:id — change table, date/time or party size.
// Every field is optional; only the ones sent are changed.
export class UpdateReservationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20, { message: 'tableNumber must be between 1 and 20' })
  tableNumber?: number;

  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'reservationDate must be a date and time like 2026-12-24T18:00:00',
    },
  )
  reservationDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'partySize must be at least 1' })
  @Max(20, { message: 'partySize cannot be more than 20' })
  partySize?: number;
}
