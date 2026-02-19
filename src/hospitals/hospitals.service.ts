import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospitalsService {
  private readonly logger = new Logger(HospitalsService.name);

  constructor(private prisma: PrismaService) { }

  async create(createHospitalDto: CreateHospitalDto) {
    this.logger.log(`Creando nuevo hospital: ${createHospitalDto.name}`);

    return await this.prisma.hospital.create({
      data: createHospitalDto,
    });
  }

  async findAll() {
    this.logger.log('Obteniendo todos los hospitales');

    return await this.prisma.hospital.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    this.logger.log(`Buscando hospital ID: ${id}`);

    const hospital = await this.prisma.hospital.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
              }
            },
            orderItems: {
              include: {
                product: true,
                measure: true,
              }
            }
          }
        }
      },
    });

    if (!hospital) {
      throw new NotFoundException(`Hospital con ID ${id} no encontrado`);
    }

    return hospital;
  }

  async update(id: number, updateHospitalDto: UpdateHospitalDto) {
    this.logger.log(`Actualizando hospital ID: ${id}`);

    // Verificar si el hospital existe
    await this.findOne(id);

    return await this.prisma.hospital.update({
      where: { id },
      data: updateHospitalDto,
    });
  }

  async remove(id: number) {
    this.logger.log(`Eliminando hospital ID: ${id}`);

    // 1. PRIMERO: Eliminar OrderItems de las órdenes del hospital
    const hospitalOrders = await this.prisma.orderStatic.findMany({
      where: { hospital_id: id },
      select: { id: true }
    });

    const orderIds = hospitalOrders.map(order => order.id);

    if (orderIds.length > 0) {
      await this.prisma.orderItemStatic.deleteMany({
        where: { order_static_id: { in: orderIds } }
      });

      await this.prisma.orderStatic.deleteMany({
        where: { id: { in: orderIds } }
      });
    }

    // 2. Eliminar relaciones con usuarios (UserHospital)
    await this.prisma.userHospital.deleteMany({
      where: { hospital_id: id }
    });

    return await this.prisma.hospital.delete({
      where: { id },
    });
  }

  // Método adicional: Obtener órdenes del hospital
  async getHospitalOrders(id: number, status?: string) {
    await this.findOne(id); // Verificar que el hospital existe

    const whereClause: any = { hospital_id: id };

    if (status) {
      whereClause.status = status;
    }

    return await this.prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
          }
        },
        orderItems: {
          include: {
            product: true,
            measure: true,
          }
        }
      },
      orderBy: { id: 'desc' }
    });
  }
}