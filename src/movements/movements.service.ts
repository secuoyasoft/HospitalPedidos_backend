import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Movement_Type } from '@prisma/client';
import { convertMeasure } from '../utils/measure-conversion.util';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) { }

  async getDashboardStats(
    startDateStr: string,
    endDateStr: string,
    hospitalIdStr?: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date(0);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    // Ensure endDate covers the entire day
    if (endDateStr) {
      endDate.setHours(23, 59, 59, 999);
    }

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (hospitalIdStr) {
      whereClause.hospital_id = parseInt(hospitalIdStr, 10);
    }

    const totalEntries = await this.prisma.movement.count({
      where: {
        ...whereClause,
        movement_type: Movement_Type.IN,
      },
    });

    const totalExits = await this.prisma.movement.count({
      where: {
        ...whereClause,
        movement_type: Movement_Type.OUT,
      },
    });

    const costAgg = await this.prisma.movement.aggregate({
      where: whereClause,
      _sum: {
        cost: true,
      },
    });
    const totalCost = costAgg._sum.cost || 0;

    const topProductsRaw = await this.prisma.movement.groupBy({
      by: ['product_name'],
      where: {
        ...whereClause,
        movement_type: Movement_Type.IN,
      },
      _count: {
        product_name: true,
      },
      orderBy: {
        _count: {
          product_name: 'desc',
        },
      },
      take: 3,
    });

    const topProducts = topProductsRaw.map((p) => ({
      name: p.product_name,
      count: p._count.product_name,
    }));

    return {
      totalEntries,
      totalExits,
      totalCost,
      topProducts,
    };
  }

  async getMovements(
    startDateStr?: string,
    endDateStr?: string,
    hospitalIdStr?: string,
  ) {
    const whereClause: any = {};
    if (startDateStr || endDateStr) {
      whereClause.date = {};
      if (startDateStr) {
        whereClause.date.gte = new Date(startDateStr);
      }
      if (endDateStr) {
        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);
        whereClause.date.lte = endDate;
      }
    }

    if (hospitalIdStr) {
      whereClause.hospital_id = parseInt(hospitalIdStr, 10);
    }

    return this.prisma.movement.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  async createBulkOut(data: any[]) {
    // data should be an array of objects:
    // { productId: number, product_name: string, quantity: number, measure: string, hospital_id: number, observation?: string }

    const operations: any[] = [];
    for (const item of data) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      let finalQuantity = item.quantity;
      let measureToSave = item.measure;

      if (product && product.preferred_measure) {
        finalQuantity = convertMeasure(
          item.quantity,
          item.measure,
          product.preferred_measure,
        );
        measureToSave = product.preferred_measure;
      }

      // 1. Register movement
      operations.push(
        this.prisma.movement.create({
          data: {
            product_id: item.productId,
            product_name: item.product_name,
            quantity: finalQuantity,
            measure: measureToSave,
            movement_type: Movement_Type.OUT,
            cost: 0,
            date: new Date(),
            observation: item.observation,
            hospital_id: item.hospital_id,
          },
        }),
      );

      // 2. Update HospitalStock and last_exit_date
      const stockRecord = await this.prisma.hospitalStock.findFirst({
        where: {
          product_id: item.productId,
          hospital_id: item.hospital_id,
        },
      });

      if (!stockRecord || stockRecord.quantity <= 0) {
        throw new Error(
          `Stock insuficiente para el producto ${item.product_name}`,
        );
      }

      operations.push(
        this.prisma.hospitalStock.update({
          where: { id: stockRecord.id },
          data: {
            quantity: { decrement: finalQuantity },
            last_exit_date: new Date(),
          },
        }),
      );
    }

    return await this.prisma.$transaction(operations);
  }
}
