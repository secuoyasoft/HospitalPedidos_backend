//jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: process.env.JWT_SECRET || 'secretKey', // Cambia esto
        });
    }

    async validate(payload: any) {
        console.log('🔐 JWT Payload validado:', payload);

        // IMPORTANTE: Esto es lo que se guarda en req.user
        return {
            sub: payload.sub,     // user.id del login
            email: payload.email,
            role: payload.role,
            full_name: payload.full_name,
            position: payload.position,
        };
    }
}