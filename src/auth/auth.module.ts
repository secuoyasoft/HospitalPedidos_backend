// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module'; // ← Módulo de usuarios (ya lo crearás)
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
    imports: [
        UsersModule, // ← Necesita acceder a la lista de usuarios
        PassportModule, // ← Activa el sistema de pasaportes/permisos
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secretKey',
            // ↑ La FIRMA SECRETA del hospital. En producción usa variable de entorno

            // signOptions: { expiresIn: '24h' },
            signOptions: { expiresIn: '100y' },
            // ↑ El carnet EXPIRA en 24 horas. Después hay que renovarlo
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy], // ← Los guardias de seguridad
    controllers: [AuthController], // ← La recepción donde llegan las peticiones
    exports: [AuthService], // ← Para usar en otros módulos
})
export class AuthModule { }