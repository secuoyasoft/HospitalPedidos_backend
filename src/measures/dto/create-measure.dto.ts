import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMeasureDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre: string;
}
