// src/measures/measures.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { UpdateMeasureDto } from './dto/update-measure.dto';
import { conversionRates } from '../utils/measure-conversion.util';
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
    const measures = await this.prisma.measure.findMany({
      orderBy: { nombre: 'asc' },
    });

    return measures.map((m) => {
      // Normalizar para buscar en el diccionario (minúsculas, sin espacios extra)
      const normalizedName = m.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
        
      const category = conversionRates[normalizedName]?.base || 'unknown';
      return {
        ...m,
        category,
      };
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
      // 3. FINALMENTE: Eliminar la unidad de medida
      this.logger.log(`Eliminando unidad ID: ${id} - "${measure.nombre}"`);

      const deletedMeasure = await this.prisma.measure.delete({
        where: { id },
      });

      this.logger.log(
        `Unidad ${id} - "${measure.nombre}" eliminada exitosamente`,
      );

      return {
        ...deletedMeasure,
        metadata: {
          message: `Unidad eliminada`,
        },
      };
    } catch (error) {
      this.logger.error(`Error al eliminar unidad ${id}:`, error);

      throw error;
    }
  }

  // Método adicional: Obtener estadísticas de uso
  async getMeasureStats(id: number) {
    const measure = await this.findOne(id);

    return {
      measure: {
        id: measure.id,
        nombre: measure.nombre,
      },
      stats: {},
    };
  }
}
