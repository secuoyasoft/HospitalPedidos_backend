// src/users/users.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Enum_Role, User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  // MÉTODO NECESARIO: Buscar por email (username)
  async findByEmail(email: string): Promise<PrismaUser | null> {
    return await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim()
      },
    });
  }

  // MÉTODO ALTERNATIVO (para mantener compatibilidad)
  async findByUsername(email: string): Promise<PrismaUser | null> {
    return this.findByEmail(email);
  }

  // CREAR USUARIO con password hasheado
  async create(createUserDto: CreateUserDto) {
    // Hashear password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        full_name: createUserDto.full_name,
        position: createUserDto.position,
        role: createUserDto.role as Enum_Role, // ADMINISTRATOR, ORDER_USER, PURCHASE_USER
        email: createUserDto.email.toLowerCase().trim(),
        phone: createUserDto.phone,
        password: hashedPassword,
      },
      select: {
        id: true,
        full_name: true,
        position: true,
        role: true,
        email: true,
        phone: true,
        // No incluir password
      },
    });
    return newUser;
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        full_name: true,
        position: true,
        role: true,
        email: true,
        phone: true,
        address: true,
        password: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        position: true,
        role: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    console.log("ENTRANDO A updateUserDto.password:", !!updateUserDto.password);    // Si se actualiza password, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        full_name: true,
        position: true,
        role: true,
        email: true,
        phone: true,
      },
    });
  }

  async remove(id: number) {
    // 1. PRIMERO: Eliminar OrderItems de las órdenes del usuario
    const userOrders = await this.prisma.order.findMany({
      where: { user_id: id },
      select: { id: true }
    });

    const orderIds = userOrders.map(order => order.id);

    if (orderIds.length > 0) {
      await this.prisma.orderItem.deleteMany({
        where: { order_id: { in: orderIds } }
      });

      await this.prisma.order.deleteMany({
        where: { id: { in: orderIds } }
      });
    }



    // ELIMINACION DE LA RELACION USUAIOhOSPITAL
    await this.prisma.userHospital.deleteMany({
      where: { user_id: id }
    });


    return await this.prisma.user.delete({
      where: { id },
    });
  }

  // MÉTODO PARA VALIDACIÓN DIRECTA (opcional)
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // Retornar sin password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}