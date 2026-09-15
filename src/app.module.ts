import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';

import { MeasuresModule } from './measures/measures.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserHospitalModule } from './user-hospital/user-hospital.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MovementsModule } from './movements/movements.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'images'),
      serveRoot: '/images',
    }),
    UsersModule,
    HospitalsModule,
    ProductsModule,
    OrdersModule,
    MeasuresModule,
    PrismaModule,
    AuthModule,
    UserHospitalModule,
    MovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
