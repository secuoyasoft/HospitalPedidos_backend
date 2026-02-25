import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Order_Status } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderDto: CreateOrderDto, userId: number) {
    return await this.prisma.order.create({
      data: {
        status: Order_Status.PENDING,
        hospital_id: createOrderDto.hospital_id,
        user_id: userId,
        orderItems: {
          create: createOrderDto.items.map(item => ({
            amount: item.amount,
            price: item.price || 0,
            product_id: item.product_id,
            measure_id: item.measure_id,
            buy_check: false,
            observation: item.observation || '',
          })),
        },
      },
      include: {
        hospital: true,
        user: true,
        orderItems: {
          include: {
            product: true,
            measure: true,
          },
        },
      },
    });
  }

  async findAll() {
    return await this.prisma.order.findMany({
      include: {
        hospital: true,
        user: true,
        orderItems: {
          include: {
            product: true,
            measure: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  // PARA ORDER_USER: Ver solo sus órdenes
  async findByUserId(userId: number) {
    return await this.prisma.order.findMany({
      where: {
        user_id: userId,
      },
      include: {
        hospital: true,
        orderItems: {
          include: {
            product: true,
            measure: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  // PARA PURCHASE_USER: Ver órdenes pendientes de compra
  async findPending() {
    return await this.prisma.order.findMany({
      where: {
        status: Order_Status.PENDING,
      },
      include: {
        hospital: true,
        user: true,
        orderItems: {
          include: {
            product: true,
            measure: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        hospital: true,
        user: true,
        orderItems: {
          include: {
            product: true,
            measure: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    // Verificar que la orden exista
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    // Solo permitir actualizar si está PENDING
    if (order.status !== Order_Status.PENDING) {
      throw new ForbiddenException('Solo se pueden modificar órdenes pendientes');
    }

    return await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        hospital: true,
        user: true,
        orderItems: {
          include: {
            product: true,
            measure: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    // Verificar que la orden exista
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${id} no encontrada`);
    }

    // Solo permitir eliminar si está PENDING
    if (order.status !== Order_Status.PENDING) {
      throw new ForbiddenException('Solo se pueden eliminar órdenes pendientes');
    }

    // PRIMERO: Eliminar OrderItems (cascade manual si no está en prisma)
    await this.prisma.orderItem.deleteMany({
      where: { order_id: id }
    });

    return await this.prisma.order.delete({
      where: { id },
    });
  }

  // MÉTODO ADICIONAL: Cambiar estado de orden a CLOSED (para compras)
  async markAsClosed(id: number) {
    return await this.prisma.order.update({
      where: { id },
      data: {
        status: Order_Status.CLOSED,
      },
    });
  }

  // ==========================================
  // ORDER STATIC (SNAPSHOTS)
  // ==========================================

  async createStatic(createOrderStaticDto: any) {
    const { items, created_at, date, id, ...orderData } = createOrderStaticDto;

    return await this.prisma.orderStatic.create({
      data: {
        ...orderData,
        status: Order_Status.PENDING,
        quantity_purchase: 0,
        quantity_details: 0,
        orderItemsStatic: {
          create: items.map(item => ({
            product_name: item.product_name,
            amount_measure: item.amount_measure,
            price: item.price,
            buy_check: item.buy_check || false,
            observation: item.observation || '',
          })),
        },
      },
      include: {
        hospital: true,
        orderItemsStatic: true,
      },
    });
  }

  async findAllStatic(hospitalId?: number) {
    const whereClause = hospitalId ? { hospital_id: hospitalId } : {};

    return await this.prisma.orderStatic.findMany({
      where: whereClause,
      include: {
        hospital: true,
        orderItemsStatic: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateStatic(id: number, updateData: any) {
    const { items, quantity_details, quantity_purchase, total_price, date, ...otherData } = updateData;

    // 1. Actualizar datos de la orden
    await this.prisma.orderStatic.update({
      where: { id },
      data: {
        ...otherData,
        quantity_details: quantity_details,
        quantity_purchase: quantity_purchase,
        total_price: total_price,
        date: date,
      },
    });

    // 2. Actualizar items si se proporcionan
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          // Actualizar item existente
          await this.prisma.orderItemStatic.update({
            where: { id: item.id },
            data: {
              price: item.price,
              observation: item.observation,
              buy_check: item.buy_check,
            },
          });
        }
      }
    }

    // 3. Retornar orden actualizada con items
    return await this.prisma.orderStatic.findUnique({
      where: { id },
      include: {
        orderItemsStatic: true,
      },
    });
  }

  async removeStatic(id: number) {
    // 1. Verificar si existe
    const order = await this.prisma.orderStatic.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`OrderStatic con ID ${id} no encontrada`);
    }

    // 2. Eliminar items relacionados
    await this.prisma.orderItemStatic.deleteMany({
      where: { order_static_id: id },
    });

    // 3. Eliminar la orden
    return await this.prisma.orderStatic.delete({
      where: { id },
    });
  }
}
