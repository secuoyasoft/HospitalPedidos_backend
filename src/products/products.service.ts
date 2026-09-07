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

  async findAll(hospitalId?: string) {
    const products = await this.prisma.product.findMany();
    
    if (hospitalId) {
      const hId = parseInt(hospitalId, 10);
      
      // Get all movements for this hospital
      const movements = await this.prisma.movement.findMany({
        where: { hospital_id: hId }
      });
      
      // Map movements by product name
      const stockMap = new Map<string, number>();
      for (const m of movements) {
        const current = stockMap.get(m.product_name) || 0;
        if (m.movement_type === 'IN') {
          stockMap.set(m.product_name, current + m.quantity);
        } else {
          stockMap.set(m.product_name, current - m.quantity);
        }
      }
      
      // Update quantity and last dates for the response
      for (const p of products) {
        p.quantity = stockMap.get(p.name) || 0;
        
        const productMovements = movements.filter(m => m.product_name === p.name);
        if (productMovements.length > 0) {
            const inMovements = productMovements.filter(m => m.movement_type === 'IN').sort((a,b) => b.date.getTime() - a.date.getTime());
            const outMovements = productMovements.filter(m => m.movement_type === 'OUT').sort((a,b) => b.date.getTime() - a.date.getTime());
            
            p.last_entry_date = inMovements.length > 0 ? inMovements[0].date : null;
            p.last_exit_date = outMovements.length > 0 ? outMovements[0].date : null;
        } else {
            p.quantity = 0;
            p.last_entry_date = null;
            p.last_exit_date = null;
        }
      }
    }
    
    return products;
  }

  async getDashboardStats(hospitalId?: string) {
    const products = await this.findAll(hospitalId);
    
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.quantity === 0).length;
    const lowStock = products.filter(p => p.quantity <= p.low_stock && p.quantity > 0).length;

    return {
      totalProducts,
      lowStock,
      outOfStock,
    };
  }

  async findOne(id: number) {
    return await this.prisma.product.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateProductDto: any, file?: Express.Multer.File) {
    if (file) {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'images');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalname.replace(/\\s/g, '_')}`;
      const filePath = path.join(uploadDir, fileName);

      const sharp = require('sharp');
      await sharp(file.buffer)
        .resize(400, 400)
        .toFile(filePath);

      const oldProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (oldProduct && oldProduct.path_img) {
        const oldFilePath = path.join(process.cwd(), oldProduct.path_img);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error(`Error al eliminar la imagen: ${oldFilePath}`, err);
          }
        }
      }

      updateProductDto.path_img = `images/${fileName}`;
    }

    if (updateProductDto.price && typeof updateProductDto.price === 'string') {
      updateProductDto.price = parseFloat(updateProductDto.price);
    }

    // Evitar sobreescribir con null str
    if (updateProductDto.path_img === 'null' || !updateProductDto.path_img) {
      delete updateProductDto.path_img;
    }

    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.delete({
      where: { id },
    });

    if (product.path_img) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), product.path_img);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Error al eliminar la imagen: ${filePath}`, err);
        }
      }
    }

    return product;
  }
}
