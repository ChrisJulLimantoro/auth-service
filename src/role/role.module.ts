import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from 'src/repositories/role.repository';
import { ValidationService } from 'src/validation/validation.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, ValidationService],
})
export class RoleModule {}
