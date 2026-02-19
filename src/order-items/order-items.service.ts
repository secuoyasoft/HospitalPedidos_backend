import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Enum_Role, Order_Status } from '@prisma/client';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) { }

  async create(createOrderItemDto: CreateOrderItemDto) {
    // 1. Verificar que la orden existe
    const order = await this.prisma.order.findUnique({
      where: { id: createOrderItemDto.order_id },
    });

    if (!order) {
      throw new NotFoundException(`Orden con ID ${createOrderItemDto.order_id} no encontrada`);
    }

    return await this.prisma.orderItem.create({
      data: createOrderItemDto,
    });
  }

  async findAll() {
    return await this.prisma.orderItem.findMany({
      include: {
        order: true,
        product: true,
        measure: true,
      },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: true,
        product: true,
        measure: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    return item;
  }

  async update(id: number, updateOrderItemDto: UpdateOrderItemDto) {
    return await this.prisma.orderItem.update({
      where: { id },
      data: updateOrderItemDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.orderItem.delete({
      where: { id },
    });
  }
}
