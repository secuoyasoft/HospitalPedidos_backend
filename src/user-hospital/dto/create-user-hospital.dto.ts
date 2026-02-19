import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateUserHospitalDto {
    @IsInt()
    @Min(1, { message: 'El ID del usuario debe ser mayor a 0' })
    user_id: number;

    @IsInt()
    @Min(1, { message: 'El ID del hospital debe ser mayor a 0' })
    hospital_id: number;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean = true;
}