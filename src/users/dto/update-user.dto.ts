import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsEmail, IsEnum, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { Enum_Role } from '@prisma/client';

export class UpdateUserDto {
    @IsOptional()  // ← DIFERENCIA CLAVE: El campo es opcional
    @IsString({ message: 'El nombre completo debe ser un texto' })
    @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre completo no puede exceder 100 caracteres' })
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
    full_name?: string;  // ← Opcional con "?"

 @IsOptional()  // ← DIFERENCIA CLAVE: El campo es opcional
    @IsString({ message: 'La dirección debe ser un texto' })
    @MinLength(3, { message: 'La dirección debe tener al menos 3 caracteres' })
    @MaxLength(200, { message: 'La dirección no puede exceder 200 caracteres' })
    @Matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\,\.\#\/\(\)]+$/, { message: 'La dirección solo puede contener letras, números y caracteres especiales permitidos' })
    address?: string;  // ← Opcional con "?"


    @IsOptional()
    @IsString({ message: 'El cargo debe ser un texto' })
    @MinLength(2, { message: 'El cargo debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El cargo no puede exceder 50 caracteres' })
    position?: string;   // ← Opcional con "?"

    @IsOptional()
    @IsEnum(Enum_Role, {
        message: `El rol debe ser uno de: ${Object.values(Enum_Role).join(', ')}`
    })
    role?: Enum_Role;    // ← Opcional con "?"

    @IsOptional()
    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    @MaxLength(100, { message: 'El email no puede exceder 100 caracteres' })
    @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
        message: 'Formato de email inválido'
    })
    email?: string;      // ← Opcional con "?"


    @IsOptional()
    @MaxLength(30, { message: 'La contraseña no puede exceder 30 caracteres' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
    })
    password?: string;      // ← Opcional con "?"


     @IsOptional()
  @IsString()
  phone?: string; // ← Agregar phone también aquí
}