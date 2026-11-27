import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Shape and rules for POST /auth/register. Invalid data → 400 Bad Request.
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(72) // bcrypt only uses the first 72 bytes
  password: string;
}
