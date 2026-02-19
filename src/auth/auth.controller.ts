// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth') // ← Todas las rutas empiezan con /auth
export class AuthController {
    constructor(private authService: AuthService) { }

    // ENDPOINT 1: LOGIN (entrar al hospital)
    @UseGuards(AuthGuard('local')) // ← El recepcionista (LocalStrategy) revisa credenciales
    @Post('login') // ← POST /auth/login
    async login(@Request() req) {
        console.log('📥 AuthController: Recibida petición de login');
        console.log('   User en Request:', req.user);
        // Si LocalStrategy dice "válido", req.user tiene los datos
        return this.authService.login(req.user); // ← Le damos su carnet
    }

    // ENDPOINT 2: REGISTER (contratar empleado)
    @Post('register') // ← POST /auth/register
    async register(@Body() createUserDto: CreateUserDto) {
        // createUserDto = {name, username, password, role, ...}
        return this.authService.register(createUserDto);
    }

    // ENDPOINT 3: PERFIL (ver mi información)
    @UseGuards(AuthGuard('jwt')) // ← Guardia JWT revisa el carnet
    @Post('profile') // ← POST /auth/profile (necesita token)
    getProfile(@Request() req) {
        // Solo llega aquí si el token es válido
        return req.user; // ← {userId, username, role, name}
    }
}