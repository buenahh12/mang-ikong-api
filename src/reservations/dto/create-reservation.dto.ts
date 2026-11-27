import { IsDateString, IsInt, Max, Min } from 'class-validator';

// Body for POST /reservations
// { "tableNumber": 5, "reservationDate": "2026-12-24T18:00:00", "partySize": 4 }
export class CreateReservationDto {
  @IsInt()
  @Min(1)
  @Max(20, { message: 'tableNumber must be between 1 and 20' })
  tableNumber: number;

  // ISO date and time, e.g. 2026-12-24T18:00:00
  @IsDateString(
    {},
    {
      message:
        'reservationDate must be a date and time like 2026-12-24T18:00:00',
    },
  )
  reservationDate: string;

  @IsInt()
  @Min(1, { message: 'partySize must be at least 1' })
  @Max(20, { message: 'partySize cannot be more than 20' })
  partySize: number;
}
