import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from 'src/repositories/role.repository';
import { ValidationService } from 'src/validation/validation.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, ValidationService, PrismaService],
})
export class RoleModule {}
