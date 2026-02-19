import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Enum_Role } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // SOLO UN USUARIO AUTENTICADO PUEDE CREAR UNA ORDEN
  @Post()
  @Roles(Enum_Role.ORDER_USER, Enum_Role.ADMINISTRATOR)
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user.sub;
    return this.ordersService.create(createOrderDto, userId);
  }

  // SOLO ADMINISTRADOR PUEDE VER TODAS LAS ORDENES
  @Get()
  @Roles(Enum_Role.ADMINISTRATOR)
  findAll() {
    return this.ordersService.findAll();
  }

  // ORDER_USER ve solo SUS órdenes
  @Get('my-orders')
  @Roles(Enum_Role.ORDER_USER, Enum_Role.ADMINISTRATOR)
  findMyOrders(@Request() req) {
    const userId = req.user.sub;
    return this.ordersService.findByUserId(+userId);
  }

  // LA COMPRA PUEDE VER LAS PENDIENTES
  @Get('pending')
  @Roles(Enum_Role.PURCHASE_USER, Enum_Role.ADMINISTRATOR)
  findPendingOrders() {
    return this.ordersService.findPending();
  }


  // ==========================================
  // ORDER STATIC (SNAPSHOTS) - MOVED TO TOP to avoid conflict with :id
  // ==========================================

  @Post('static')
  createStatic(@Body() createOrderStaticDto: any) {
    return this.ordersService.createStatic(createOrderStaticDto);
  }

  @Get('static')
  findAllStatic(@Query('hospitalId') hospitalId?: string) {
    return this.ordersService.findAllStatic(hospitalId ? +hospitalId : undefined);
  }

  @Patch('static/:id')
  @Roles(Enum_Role.ADMINISTRATOR, Enum_Role.PURCHASE_USER, Enum_Role.ORDER_USER)
  updateStatic(@Param('id') id: string, @Body() updateData: any) {
    return this.ordersService.updateStatic(+id, updateData);
  }

  @Delete('static/:id')
  @Roles(Enum_Role.ADMINISTRATOR)
  removeStatic(@Param('id') id: string) {
    return this.ordersService.removeStatic(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const order = await this.ordersService.findOne(+id);
    const userId = req.user.sub;
    const userRole = req.user.role;

    // Si no es admin y no es su orden, no puede verla
    if (userRole !== Enum_Role.ADMINISTRATOR && order.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta orden');
    }

    return order;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    // Verificar permisos
    const order = await this.ordersService.findOne(+id);

    if (userRole !== Enum_Role.ADMINISTRATOR && order.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para actualizar esta orden');
    }

    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    // Verificar permisos
    const order = await this.ordersService.findOne(+id);

    if (userRole !== Enum_Role.ADMINISTRATOR && order.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta orden');
    }

    return this.ordersService.remove(+id);
  }

  @Post(':id/close')
  @Roles(Enum_Role.PURCHASE_USER, Enum_Role.ADMINISTRATOR)
  markAsClosed(@Param('id') id: string) {
    return this.ordersService.markAsClosed(+id);
  }

}
