// src/measures/measures.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { UpdateMeasureDto } from './dto/update-measure.dto';

@Injectable()
export class MeasuresService {
  private readonly logger = new Logger(MeasuresService.name);

  constructor(private prisma: PrismaService) {}

  async create(createMeasureDto: CreateMeasureDto) {
    this.logger.log(`Creando nueva unidad: ${createMeasureDto.nombre}`);
    return await this.prisma.measure.create({
      data: createMeasureDto,
    });
  }

  async findAll() {
    this.logger.log('Obteniendo todas las unidades de medida');
    return await this.prisma.measure.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    this.logger.log(`Buscando unidad ID: ${id}`);
    
    const measure = await this.prisma.measure.findUnique({
      where: { id },
    });

    if (!measure) {
      throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    }

    return measure;
  }

  async update(id: number, updateMeasureDto: UpdateMeasureDto) {
    this.logger.log(`Actualizando unidad ID: ${id}`);
    
    // Verificar si la unidad existe
    await this.findOne(id);
    
    return await this.prisma.measure.update({
      where: { id },
      data: updateMeasureDto,
    });
  }

  async remove(id: number) {
    this.logger.log(`Iniciando eliminación de unidad ID: ${id}`);
    
    // Verificar si la unidad existe
    const measure = await this.findOne(id);
    
    try {
      // 1. PRIMERO: Contar OrderItems que usan esta medida
      const orderItemsCount = await this.prisma.orderItem.count({
        where: { measure_id: id }
      });
      
      this.logger.log(`Unidad "${measure.nombre}" tiene: ${orderItemsCount} items de órdenes`);

      // 2. Eliminar OrderItems que usan esta medida (si existen)
      if (orderItemsCount > 0) {
        this.logger.log(`Eliminando ${orderItemsCount} OrderItems que usan esta medida`);
        
        await this.prisma.orderItem.deleteMany({
          where: { measure_id: id }
        });
        
        this.logger.log(`Eliminados ${orderItemsCount} OrderItems`);
      }

      // 3. FINALMENTE: Eliminar la unidad de medida
      this.logger.log(`Eliminando unidad ID: ${id} - "${measure.nombre}"`);
      
      const deletedMeasure = await this.prisma.measure.delete({
        where: { id }
      });
      
      this.logger.log(`Unidad ${id} - "${measure.nombre}" eliminada exitosamente`);
      
      return {
        ...deletedMeasure,
        metadata: {
          order_items_deleted: orderItemsCount,
          message: `Unidad eliminada junto con ${orderItemsCount} items de órdenes`
        }
      };
      
    } catch (error) {
      this.logger.error(`Error al eliminar unidad ${id}:`, error);
      
      // Mejorar mensaje de error para el cliente
      if (error.code === 'P2003') { // Foreign key constraint failed
        throw new Error(
          `No se puede eliminar la unidad "${measure.nombre}" porque aún está siendo usada en items de órdenes. ` +
          `Contacta al administrador del sistema.`
        );
      }
      
      throw error;
    }
  }

  // Método adicional: Obtener estadísticas de uso
  async getMeasureStats(id: number) {
    const measure = await this.findOne(id);
    
    const orderItemsCount = await this.prisma.orderItem.count({
      where: { measure_id: id }
    });
    
    return {
      measure: {
        id: measure.id,
        nombre: measure.nombre,
      },
      stats: {
        total_order_items: orderItemsCount,
        in_use: orderItemsCount > 0,
      }
    };
  }
}