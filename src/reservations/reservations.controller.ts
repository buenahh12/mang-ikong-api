import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationQueryDto } from './dto/reservation-query.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsService } from './reservations.service';

// Every reservations route needs a login. RolesGuard only blocks routes marked @Roles(...)
@Controller('reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  // POST /reservations → book a table
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(user.userId, dto);
  }

  // GET /reservations/my → the logged-in user's reservations
  // (declared before ':id' so "my" isn't treated as an id)
  @Get('my')
  findMine(@CurrentUser() user: AuthUser) {
    return this.reservationsService.findMine(user.userId);
  }

  // GET /reservations → all reservations (admin), optional ?status=pending
  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: ReservationQueryDto) {
    return this.reservationsService.findAll(query);
  }

  // GET /reservations/:id → owner or admin
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.findOneFor(id, user);
  }

  // PATCH /reservations/:id → change table, time or party size (owner or admin)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationsService.update(id, dto, user);
  }

  // PATCH /reservations/:id/status → admin confirms or cancels
  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateStatus(id, dto.status);
  }

  // DELETE /reservations/:id → owner or admin
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.reservationsService.remove(id, user);
  }
}
