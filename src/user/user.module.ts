import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { RoleService } from 'src/role/role.service';
import { RoleRepository } from 'src/repositories/role.repository';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, RoleService, RoleRepository],
})
export class UserModule {}
