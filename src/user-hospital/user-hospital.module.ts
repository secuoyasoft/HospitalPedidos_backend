import { Module } from '@nestjs/common';
import { UserHospitalService } from './user-hospital.service';
import { UserHospitalController } from './user-hospital.controller';

@Module({
  controllers: [UserHospitalController],
  providers: [UserHospitalService],
})
export class UserHospitalModule {}
