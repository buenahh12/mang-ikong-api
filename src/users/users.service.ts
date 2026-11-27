import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    // The repository is TypeORM's object for reading/writing the users table
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({ order: { userId: 'ASC' } });
  }

  async findOne(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }
    return user;
  }

  // Used only by login: passwordHash has select:false, so we must ask for it explicitly
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
  }): Promise<User> {
    await this.ensureEmailIsFree(data.email);
    const user = this.usersRepository.create(data);
    const saved = await this.usersRepository.save(user);
    // Re-load so the response never includes the password hash
    return this.findOne(saved.userId);
  }

  async update(userId: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);
    if (dto.email && dto.email !== user.email) {
      await this.ensureEmailIsFree(dto.email);
    }
    Object.assign(user, dto);
    await this.usersRepository.save(user);
    return this.findOne(userId);
  }

  async remove(userId: number): Promise<{ message: string }> {
    const user = await this.findOne(userId);
    await this.usersRepository.remove(user);
    return { message: `User #${userId} deleted` };
  }

  private async ensureEmailIsFree(email: string): Promise<void> {
    const exists = await this.usersRepository.exists({ where: { email } });
    if (exists) {
      throw new ConflictException('Email is already registered');
    }
  }
}
