import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Not, Repository } from 'typeorm';
import type { AuthUser } from '../auth/jwt-payload.interface';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationQueryDto } from './dto/reservation-query.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  ReservationStatus,
  TableReservation,
} from './entities/table-reservation.entity';

// A table is considered taken for 2 hours from the reservation time
const SLOT_MS = 2 * 60 * 60 * 1000;

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(TableReservation)
    private readonly reservationsRepository: Repository<TableReservation>,
  ) {}

  async create(
    userId: number,
    dto: CreateReservationDto,
  ): Promise<TableReservation> {
    const date = this.parseFutureDate(dto.reservationDate);
    await this.ensureTableIsFree(dto.tableNumber, date);

    const reservation = this.reservationsRepository.create({
      user: { userId } as User,
      tableNumber: dto.tableNumber,
      reservationDate: date,
      partySize: dto.partySize,
      status: ReservationStatus.PENDING,
    });
    const saved = await this.reservationsRepository.save(reservation);
    return this.load(saved.reservationId);
  }

  // GET /reservations/my
  findMine(userId: number): Promise<TableReservation[]> {
    return this.reservationsRepository.find({
      where: { user: { userId } },
      order: { reservationDate: 'ASC' },
    });
  }

  // GET /reservations (admin) — includes who booked
  findAll(query: ReservationQueryDto): Promise<TableReservation[]> {
    return this.reservationsRepository.find({
      where: query.status ? { status: query.status } : {},
      relations: { user: true },
      order: { reservationDate: 'ASC' },
    });
  }

  // GET /reservations/:id — owner or admin
  async findOneFor(
    reservationId: number,
    requester: AuthUser,
  ): Promise<TableReservation> {
    const reservation = await this.load(reservationId);
    this.ensureOwnerOrAdmin(reservation, requester);
    return reservation;
  }

  // PATCH /reservations/:id — owner (while pending) or admin
  async update(
    reservationId: number,
    dto: UpdateReservationDto,
    requester: AuthUser,
  ): Promise<TableReservation> {
    const reservation = await this.findOneFor(reservationId, requester);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException(
        'A cancelled reservation cannot be changed',
      );
    }
    if (
      requester.role !== UserRole.ADMIN &&
      reservation.status !== ReservationStatus.PENDING
    ) {
      throw new BadRequestException(
        'Only pending reservations can be changed. Please contact the restaurant.',
      );
    }

    const tableNumber = dto.tableNumber ?? reservation.tableNumber;
    const date = dto.reservationDate
      ? this.parseFutureDate(dto.reservationDate)
      : reservation.reservationDate;

    // Re-check the slot only if the table or time changed
    if (dto.tableNumber !== undefined || dto.reservationDate !== undefined) {
      await this.ensureTableIsFree(tableNumber, date, reservationId);
    }

    reservation.tableNumber = tableNumber;
    reservation.reservationDate = date;
    reservation.partySize = dto.partySize ?? reservation.partySize;
    await this.reservationsRepository.save(reservation);
    return this.load(reservationId);
  }

  // PATCH /reservations/:id/status (admin) — confirm or cancel
  async updateStatus(
    reservationId: number,
    status: ReservationStatus,
  ): Promise<TableReservation> {
    const reservation = await this.load(reservationId);
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException(
        `Reservation #${reservationId} is already cancelled and can no longer change`,
      );
    }
    await this.reservationsRepository.update({ reservationId }, { status });
    return this.load(reservationId);
  }

  // DELETE /reservations/:id — owner or admin
  async remove(
    reservationId: number,
    requester: AuthUser,
  ): Promise<{ message: string }> {
    const reservation = await this.findOneFor(reservationId, requester);
    await this.reservationsRepository.remove(reservation);
    return { message: `Reservation #${reservationId} deleted` };
  }

  // ---------- helpers ----------

  private async load(reservationId: number): Promise<TableReservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { reservationId },
      relations: { user: true },
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation #${reservationId} not found`);
    }
    return reservation;
  }

  private ensureOwnerOrAdmin(
    reservation: TableReservation,
    requester: AuthUser,
  ): void {
    const isOwner = reservation.user.userId === requester.userId;
    if (!isOwner && requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only access your own reservations');
    }
  }

  private parseFutureDate(value: string): Date {
    const date = new Date(value);
    if (date.getTime() <= Date.now()) {
      throw new BadRequestException('reservationDate must be in the future');
    }
    return date;
  }

  // Blocks double-booking: same table, active reservation within 2 hours
  private async ensureTableIsFree(
    tableNumber: number,
    date: Date,
    ignoreReservationId?: number,
  ): Promise<void> {
    const clash = await this.reservationsRepository.findOne({
      where: {
        tableNumber,
        status: In([ReservationStatus.PENDING, ReservationStatus.CONFIRMED]),
        reservationDate: Between(
          new Date(date.getTime() - SLOT_MS + 1),
          new Date(date.getTime() + SLOT_MS - 1),
        ),
        ...(ignoreReservationId
          ? { reservationId: Not(ignoreReservationId) }
          : {}),
      },
    });
    if (clash) {
      throw new ConflictException(
        `Table ${tableNumber} is already reserved around that time. Please choose another table or time.`,
      );
    }
  }
}
