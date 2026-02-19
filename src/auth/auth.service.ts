// src/auth/auth.service.ts - VERSIÓN COMPLETA
import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        console.log(`🔍 AuthService: Buscando usuario por email: ${email}`);
        const user = await this.usersService.findByEmail(email);

        if (user) {
            console.log('✅ Usuario encontrado en BD');
            // console.log('🔑 Hash almacenado:', user.password); // Descomentar solo si es necesario depurar hashes

            const isMatch = await bcrypt.compare(password, user.password);
            console.log(`🔐 Resultado de comparación de contraseña: ${isMatch}`);

            if (isMatch) {
                const { password, ...result } = user;
                return result;
            }
        } else {
            console.log('❌ Usuario NO encontrado en BD');
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            full_name: user.full_name,
            position: user.position
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                full_name: user.full_name,
                position: user.position,
                role: user.role,
                email: user.email
            },
        };
    }

    async register(createUserDto: CreateUserDto) {
        // 1. Verificar si el usuario ya existe
        const existingUser = await this.usersService.findByEmail(createUserDto.email);

        if (existingUser) {
            throw new ConflictException('El email ya está registrado');
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // 3. Preparar datos del usuario con contraseña hasheada
        const userData = {
            ...createUserDto,
            password: hashedPassword
        };

        // 4. Crear usuario usando el UsersService
        const newUser = await this.usersService.create(userData);

        // 5. Retornar el usuario creado (sin contraseña)
        return {
            message: 'Usuario registrado exitosamente',
            user: newUser
        };
    }
}