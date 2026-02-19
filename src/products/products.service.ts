import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(createProductDto: any, file?: Express.Multer.File) {
    if (file) {
      // 1. Asegurar que el directorio images/ existe
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'images');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 2. Generar nombre de archivo único
      const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, fileName);

      // 3. Redimensionar y guardar usando sharp
      const sharp = require('sharp');
      await sharp(file.buffer)
        .resize(400, 400)
        .toFile(filePath);

      // 4. Guardar la ruta relativa en la base de datos
      createProductDto.path_img = `images/${fileName}`;
    }

    // Convertir precio a número si viene como string (común en multipart)
    if (createProductDto.price && typeof createProductDto.price === 'string') {
      createProductDto.price = parseFloat(createProductDto.price);
    }

    // Convertir otras propiedades si es necesario

    return await this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
