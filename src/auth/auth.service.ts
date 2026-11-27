import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt-payload.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    // Never store the real password: save only its bcrypt hash
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    // New accounts are always customers; admins are created separately
    return this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    // Same message for wrong email and wrong password, so attackers can't tell which
    const passwordOk =
      user !== null && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  getProfile(userId: number): Promise<User> {
    return this.usersService.findOne(userId);
  }
}
