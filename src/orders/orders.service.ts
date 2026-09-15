import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Order_Status, Movement_Type } from '@prisma/client';
import {
  convertMeasure,
  parseAmountMeasure,
} from '../utils/measure-conversion.util';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
          create: items.map((item) => ({
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
    const {
      items,
      quantity_details,
      quantity_purchase,
      total_price,
      date,
      status,
      ...otherData
    } = updateData;

    // Verificar el estado anterior de la orden para no duplicar movimientos
    const existingOrder = await this.prisma.orderStatic.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new NotFoundException(`OrderStatic con ID ${id} no encontrada`);
    }

    const previousStatus = existingOrder.status;

    // 1. Actualizar datos de la orden
    const updatePayload: any = {
      ...otherData,
      quantity_details: quantity_details,
      quantity_purchase: quantity_purchase,
      total_price: total_price,
      date: date,
    };
    if (status) {
      updatePayload.status = status;
    }

    await this.prisma.orderStatic.update({
      where: { id },
      data: updatePayload,
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
    const updatedOrder = await this.prisma.orderStatic.findUnique({
      where: { id },
      include: {
        orderItemsStatic: true,
      },
    });

    // 4. Generar movimientos y actualizar inventario si el pedido fue cerrado
    if (status === 'CLOSED' && previousStatus !== 'CLOSED' && updatedOrder) {
      for (const item of updatedOrder.orderItemsStatic) {
        const { quantity, measure } = parseAmountMeasure(item.amount_measure);

        // Buscar el producto original para obtener su preferred_measure
        const product = await this.prisma.product.findFirst({
          where: { name: item.product_name },
        });

        let finalQuantity = quantity;

        if (product) {
          // Convertir la cantidad si preferred_measure está definido
          finalQuantity = convertMeasure(
            quantity,
            measure,
            product.preferred_measure,
          );

          // Actualizar o crear stock en HospitalStock
          const stockRecord = await this.prisma.hospitalStock.findFirst({
            where: {
              product_id: product.id,
              hospital_id: updatedOrder.hospital_id,
            },
          });

          if (stockRecord) {
            await this.prisma.hospitalStock.update({
              where: { id: stockRecord.id },
              data: {
                quantity: stockRecord.quantity + finalQuantity,
                last_entry_date: new Date(),
              },
            });
          } else {
            await this.prisma.hospitalStock.create({
              data: {
                product_id: product.id,
                product_name: product.name,
                hospital_id: updatedOrder.hospital_id,
                quantity: finalQuantity,
                last_entry_date: new Date(),
              },
            });
          }
        }

        // Crear el movimiento con la cantidad y medida convertida
        await this.prisma.movement.create({
          data: {
            product_id: product?.id,
            product_name: item.product_name,
            quantity: finalQuantity, // Guardamos la cantidad convertida
            measure: product?.preferred_measure || measure, // Guardamos la medida preferida si existe
            movement_type: Movement_Type.IN,
            cost: item.price || 0,
            date: new Date(),
            observation: item.observation,
            hospital_id: updatedOrder.hospital_id,
          },
        });
      }
    }

    return updatedOrder;
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
