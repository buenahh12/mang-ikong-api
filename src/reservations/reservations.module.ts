import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableReservation } from './entities/table-reservation.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [TypeOrmModule.forFeature([TableReservation])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
