// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Enum_Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Enum_Role[]) => SetMetadata(ROLES_KEY, roles);