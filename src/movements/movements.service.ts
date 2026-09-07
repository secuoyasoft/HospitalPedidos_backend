import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(startDateStr: string, endDateStr: string, hospitalIdStr?: string) {
    let startDate = startDateStr ? new Date(startDateStr) : new Date(0);
    let endDate = endDateStr ? new Date(endDateStr) : new Date();

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
        movement_type: 'IN',
      },
    });

    const totalExits = await this.prisma.movement.count({
      where: {
        ...whereClause,
        movement_type: 'OUT',
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
        movement_type: 'IN',
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

  async getMovements(startDateStr?: string, endDateStr?: string, hospitalIdStr?: string) {
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
      // 1. Register movement
      operations.push(
        this.prisma.movement.create({
          data: {
            product_name: item.product_name,
            quantity: item.quantity,
            measure: item.measure,
            movement_type: 'OUT',
            cost: 0,
            date: new Date(),
            observation: item.observation,
            hospital_id: item.hospital_id,
          },
        }),
      );

      // 2. Update product stock and last_exit_date
      operations.push(
        this.prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            last_exit_date: new Date(),
          },
        }),
      );
    }

    return await this.prisma.$transaction(operations);
  }
}
