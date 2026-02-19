import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHospitalDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    address: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    contact: string;
}
