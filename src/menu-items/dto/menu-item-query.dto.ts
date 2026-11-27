import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

// Optional filters for GET /menu-items?category=Ulam&available=true
export class MenuItemQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  // Query strings are always text, so turn "true"/"false" into a real boolean
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'available must be true or false' })
  available?: boolean;
}
