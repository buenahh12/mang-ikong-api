import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MenuItem } from './menu-items/entities/menu-item.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { TableReservation } from './reservations/entities/table-reservation.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // Loads the .env file so every module can read DB_* and JWT_* settings
    ConfigModule.forRoot({ isGlobal: true }),

    // Connects to MySQL using the values from .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 3306)),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME'),
        entities: [User, MenuItem, Order, OrderItem, TableReservation],
        // Creates/updates the tables from the entities automatically.
        // Fine for development; turn off in production.
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
