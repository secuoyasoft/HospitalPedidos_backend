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

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Enum_Role } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // ==========================================
  // ORDER STATIC (SNAPSHOTS)
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


}
