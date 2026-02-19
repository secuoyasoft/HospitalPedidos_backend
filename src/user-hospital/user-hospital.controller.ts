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
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserHospitalService } from './user-hospital.service';
import { CreateUserHospitalDto } from './dto/create-user-hospital.dto';
import { UpdateUserHospitalDto } from './dto/update-user-hospital.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Enum_Role } from '@prisma/client';

@Controller('user-hospitals')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UserHospitalController {
  constructor(private readonly userHospitalService: UserHospitalService) { }

  // ========== ENDPOINTS CRUD BÁSICOS (Solo ADMIN) ==========

  @Post()
  @Roles(Enum_Role.ADMINISTRATOR)
  create(@Body() createUserHospitalDto: CreateUserHospitalDto) {
    return this.userHospitalService.create(createUserHospitalDto);
  }
  @Get()
  @Roles(Enum_Role.ADMINISTRATOR, Enum_Role.PURCHASE_USER, Enum_Role.ORDER_USER)
  findAll() {
    return this.userHospitalService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string, @Request() req) {

  //   console.log('🎯 ENDPOINT: GET /user-hospitals/:id');
  //   console.log('🎯 Parámetro id:', id);
  //   console.log('🎯 User ID:', req.user.sub);
  //   const assignment = await this.userHospitalService.findOne(+id);

  //   // Solo admin o el usuario asignado puede ver la asignación
  //   if (req.user.role !== Enum_Role.ADMINISTRATOR &&
  //     assignment.user_id !== req.user.sub) {
  //     throw new ForbiddenException('No tienes permiso para ver esta asignación');
  //   }

  //   return assignment;
  // }

  @Patch(':id')
  @Roles(Enum_Role.ADMINISTRATOR)
  update(
    @Param('id') id: string,
    @Body() updateUserHospitalDto: UpdateUserHospitalDto,
  ) {
    console.log('🎯 ENDPOINT: PATCH /user-hospitals/:id');
    console.log('🎯 Parámetro id:', id);
    return this.userHospitalService.update(+id, updateUserHospitalDto);
  }

  @Delete(':id')
  @Roles(Enum_Role.ADMINISTRATOR)
  remove(@Param('id') id: string) {
    console.log('🎯 ENDPOINT: DELETE /user-hospitals/:id');
    console.log('🎯 Parámetro id:', id);
    return this.userHospitalService.remove(+id);
  }

  // ========== ENDPOINTS PERSONALIZADOS ==========

  // Asignar usuario a hospital (más simple que create)
  @Post('assign')
  @Roles(Enum_Role.ADMINISTRATOR)
  assignUserToHospital(
    @Body() body: { user_id: number; hospital_id: number },
  ) {
    return this.userHospitalService.assignUserToHospital(
      body.user_id,
      body.hospital_id,
    );
  }

  // Desasignar usuario de hospital
  @Delete('user/:userId/hospital/:hospitalId')
  @Roles(Enum_Role.ADMINISTRATOR)
  removeUserFromHospital(
    @Param('userId') userId: string,
    @Param('hospitalId') hospitalId: string,
  ) {
    return this.userHospitalService.removeUserFromHospital(+userId, +hospitalId);
  }

  // Ver hospitales de un usuario
  @Get('user/:userId/hospitals')
  async getUserHospitals(
    @Param('userId') userId: string,
    @Request() req,
  ) {
    const currentUserId = req.user.sub;
    const currentUserRole = req.user.role;

    // Solo puede ver sus propias asignaciones a menos que sea admin
    if (currentUserRole !== Enum_Role.ADMINISTRATOR &&
      currentUserId !== +userId) {
      throw new ForbiddenException('No puedes ver las asignaciones de otro usuario');
    }

    return this.userHospitalService.getUserHospitals(+userId);
  }

  // Ver MIS hospitales (conveniente para el usuario actual)
  // En user-hospital.controller.ts - método getMyHospitals
  @Get('my-hospitals')
  @Roles(Enum_Role.ORDER_USER, Enum_Role.PURCHASE_USER, Enum_Role.ADMINISTRATOR)
  getMyHospitals(@Request() req) {
    console.log('🔍 ====== /my-hospitals llamado ======');
    console.log('🔍 req.user completo:', req.user);
    console.log('🔍 req.user.sub (userId):', req.user.sub);
    console.log('🔍 Tipo de userId:', typeof req.user.sub);
    console.log('🔍 User role:', req.user.role);

    const userId = req.user.sub;

    // Verificar si userId es válido
    if (!userId || isNaN(userId)) {
      console.log('❌ ERROR: userId inválido:', userId);
      throw new Error('Usuario no autenticado correctamente');
    }

    console.log('🔍 Llamando a service con userId:', userId);
    return this.userHospitalService.getUserHospitals(userId);
  }

  // En user-hospital.controller.ts
  @Get('debug/my-hospitals')
  @UseGuards(AuthGuard('jwt'))
  debugMyHospitals(@Request() req) {
    console.log('🔧 ====== DEBUG ENDPOINT ======');
    console.log('🔧 req.user:', JSON.stringify(req.user, null, 2));

    // Devolver directamente los datos del usuario del token
    return {
      message: 'Datos del token JWT',
      userFromToken: req.user,
      timestamp: new Date().toISOString(),
    };
  }


  // Ver usuarios de un hospital (solo admin)
  @Get('hospital/:hospitalId/users')
  @Roles(Enum_Role.ADMINISTRATOR)
  getHospitalUsers(@Param('hospitalId') hospitalId: string) {
    return this.userHospitalService.getHospitalUsers(+hospitalId);
  }

  // Verificar si un usuario está asignado a un hospital
  @Get('check-assignment')
  async checkAssignment(
    @Query('user_id') userId: string,
    @Query('hospital_id') hospitalId: string,
    @Request() req,
  ) {
    const currentUserRole = req.user.role;
    const currentUserId = req.user.sub;

    // Solo admin puede verificar asignaciones de otros usuarios
    if (currentUserRole !== Enum_Role.ADMINISTRATOR &&
      currentUserId !== +userId) {
      throw new ForbiddenException('No puedes verificar asignaciones de otros usuarios');
    }

    const isAssigned = await this.userHospitalService.isUserAssignedToHospital(
      +userId,
      +hospitalId,
    );

    return {
      user_id: +userId,
      hospital_id: +hospitalId,
      is_assigned: isAssigned,
    };
  }

  // Verificar si YO estoy asignado a un hospital (para el usuario actual)
  @Get('check-my-assignment/:hospitalId')
  @Roles(Enum_Role.ORDER_USER, Enum_Role.PURCHASE_USER, Enum_Role.ADMINISTRATOR)
  async checkMyAssignment(
    @Param('hospitalId') hospitalId: string,
    @Request() req,
  ) {
    const userId = req.user.sub;
    const isAssigned = await this.userHospitalService.isUserAssignedToHospital(
      userId,
      +hospitalId,
    );

    return {
      user_id: userId,
      hospital_id: +hospitalId,
      is_assigned: isAssigned,
      message: isAssigned
        ? 'Estás asignado a este hospital'
        : 'No estás asignado a este hospital',
    };
  }

  // ========== ENDPOINTS PARA ÓRDENES ==========

  // Validar si el usuario puede crear órdenes en un hospital
  @Get('validate-order-permission/:hospitalId')
  @Roles(Enum_Role.ORDER_USER, Enum_Role.ADMINISTRATOR)
  async validateOrderPermission(
    @Param('hospitalId') hospitalId: string,
    @Request() req,
  ) {
    const userId = req.user.sub;
    const isAssigned = await this.userHospitalService.isUserAssignedToHospital(
      userId,
      +hospitalId,
    );

    if (!isAssigned) {
      throw new ForbiddenException(
        'No estás asignado a este hospital. No puedes crear órdenes aquí.',
      );
    }

    return {
      valid: true,
      message: 'Tienes permiso para crear órdenes en este hospital',
      user_id: userId,
      hospital_id: +hospitalId,
    };
  }
}