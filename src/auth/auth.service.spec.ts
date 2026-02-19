// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    // Usar el método del UsersService
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    // Importar bcrypt
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Retornar sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: any) {
    // Payload del token según TU esquema
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role, // ADMINISTRATOR, ORDER_USER, PURCHASE_USER
      name: user.full_name,
      position: user.position,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        full_name: user.full_name,
        position: user.position,
        role: user.role,
        email: user.email,
      },
    };
  }

  async register(createUserDto: any) {
    return await this.usersService.create(createUserDto);
  }
}