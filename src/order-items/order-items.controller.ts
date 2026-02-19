import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Enum_Role } from '@prisma/client';

@Controller('order-items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) { }

  @Post()
  @Roles(Enum_Role.ORDER_USER, Enum_Role.ADMINISTRATOR)
  create(@Body() createOrderItemDto: CreateOrderItemDto) {
    return this.orderItemsService.create(createOrderItemDto);
  }

  @Get()
  @Roles(Enum_Role.ADMINISTRATOR)
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Enum_Role.ORDER_USER, Enum_Role.ADMINISTRATOR)
  update(@Param('id') id: string, @Body() updateOrderItemDto: UpdateOrderItemDto) {
    return this.orderItemsService.update(+id, updateOrderItemDto);
  }

  @Delete(':id')
  @Roles(Enum_Role.ORDER_USER, Enum_Role.ADMINISTRATOR)
  remove(@Param('id') id: string) {
    return this.orderItemsService.remove(+id);
  }
}

