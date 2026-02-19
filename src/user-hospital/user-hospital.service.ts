// user-hospital.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserHospitalDto } from './dto/create-user-hospital.dto';
import { UpdateUserHospitalDto } from './dto/update-user-hospital.dto';


@Injectable()
export class UserHospitalService {
  constructor(private prisma: PrismaService) { }

  // ========== CRUD BÁSICO ==========

  async create(createUserHospitalDto: CreateUserHospitalDto) {
    try {
      return await this.prisma.userHospital.create({
        data: {
          user_id: createUserHospitalDto.user_id,
          hospital_id: createUserHospitalDto.hospital_id,
          is_active: createUserHospitalDto.is_active ?? true,
        },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              role: true,
            },
          },
          hospital: true,
        },
      });
    } catch (error) {
      // Si ya existe la asignación
      if (error.code === 'P2002') {
        throw new Error('Este usuario ya está asignado a este hospital');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.userHospital.findMany({
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        hospital: true,
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    console.log('🔍 findOne llamado con id:', id);
    console.log('🔍 Tipo de id:', typeof id);
    console.log('🔍 id es NaN?', isNaN(id));
    const userHospital = await this.prisma.userHospital.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        hospital: true,
      },
    });

    if (!userHospital) {
      throw new NotFoundException(`Asignación con ID ${id} no encontrada`);
    }

    return userHospital;
  }

  async update(id: number, updateUserHospitalDto: UpdateUserHospitalDto) {
    // Verificar que exista
    await this.findOne(id);

    try {
      return await this.prisma.userHospital.update({
        where: { id },
        data: updateUserHospitalDto,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              role: true,
            },
          },
          hospital: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Esta asignación ya existe');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Verificar que exista
    await this.findOne(id);

    return await this.prisma.userHospital.delete({
      where: { id },
    });
  }
  async assignUserToHospital(userId: number, hospitalId: number) {
    return await this.prisma.userHospital.create({
      data: {
        user_id: userId,
        hospital_id: hospitalId,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        hospital: true,
      },
    });
  }

  async removeUserFromHospital(userId: number, hospitalId: number) {
    return await this.prisma.userHospital.deleteMany({
      where: {
        user_id: userId,
        hospital_id: hospitalId,
      },
    });
  }

  async getUserHospitals(userId: number) {
    return await this.prisma.userHospital.findMany({
      where: { user_id: userId },
      include: { hospital: true },
    });
  }

  async getHospitalUsers(hospitalId: number) {
    return await this.prisma.userHospital.findMany({
      where: { hospital_id: hospitalId },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
            position: true,
          },
        },
      },
    });
  }

  async isUserAssignedToHospital(userId: number, hospitalId: number): Promise<boolean> {
    const assignment = await this.prisma.userHospital.findFirst({
      where: {
        user_id: userId,
        hospital_id: hospitalId,
        is_active: true,
      },
    });
    return !!assignment;
  }
}