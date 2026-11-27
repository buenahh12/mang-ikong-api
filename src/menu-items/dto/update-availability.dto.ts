import { IsBoolean } from 'class-validator';

// Body for PATCH /menu-items/:id/availability → { "isAvailable": false }
export class UpdateAvailabilityDto {
  @IsBoolean()
  isAvailable: boolean;
}
