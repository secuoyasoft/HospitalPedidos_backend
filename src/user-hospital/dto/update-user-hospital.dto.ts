import { PartialType } from '@nestjs/mapped-types';
import { CreateUserHospitalDto } from './create-user-hospital.dto';

export class UpdateUserHospitalDto extends PartialType(CreateUserHospitalDto) { }