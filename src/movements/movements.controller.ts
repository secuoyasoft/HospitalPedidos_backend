import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { MovementsService } from './movements.service';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get('dashboard-stats')
  getDashboardStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return this.movementsService.getDashboardStats(
      startDate,
      endDate,
      hospitalId,
    );
  }

  @Get()
  getMovements(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    return this.movementsService.getMovements(startDate, endDate, hospitalId);
  }

  @Post('bulk-out')
  createBulkOut(@Body() data: any[]) {
    return this.movementsService.createBulkOut(data);
  }
}
