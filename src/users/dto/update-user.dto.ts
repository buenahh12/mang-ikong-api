import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

// Admin-only: every field is optional, only the ones sent are changed
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be customer or admin' })
  role?: UserRole;
}
