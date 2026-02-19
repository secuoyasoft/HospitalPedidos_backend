// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Enum_Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  position: string; // En tu esquema es obligatorio


  @IsOptional()
  @IsString()
  address?: string;


  @IsNotEmpty()
  @IsEnum(Enum_Role, {
    message: 'Rol debe ser: ADMINISTRATOR, ORDER_USER o PURCHASE_USER'
  })
  role: Enum_Role;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}