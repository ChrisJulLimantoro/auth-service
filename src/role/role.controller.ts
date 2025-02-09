import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { Post, Body, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { Describe } from 'src/decorator/describe.decorator';

@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @MessagePattern({ cmd: 'post:role' })
  @Describe({ description: 'Create a new role', fe: ['settings/role:add'] })
  async create(@Payload() data: any): Promise<CustomResponse> {
    const create = data.body;
    create.owner_id = data.params.user.id;
    return this.service.create(create);
  }

  @MessagePattern({ cmd: 'get:role-user/*' })
  @Describe({
    description: 'Get all roles assigned to a user',
    fe: ['settings/user-role:all'],
  })
  async getRolesByUser(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.getRolesByUser(param.id);
  }

  @MessagePattern({ cmd: 'get:user-role/*' })
  @Describe({
    description: 'Get all users assigned to a role',
    fe: ['settings/user-role:all'],
  })
  async getUsersByRole(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.getUsersByRole(param.id);
  }

  @MessagePattern({ cmd: 'get:role' })
  @Describe({
    description: 'Get all role',
    fe: ['settings/role:open', 'settings/user-role:all'],
  })
  async findAll(@Payload() data: any): Promise<CustomResponse> {
    const filter = data.body;
    return this.service.findAll(filter);
  }

  @MessagePattern({ cmd: 'get:role/*' })
  @Describe({
    description: 'Get a role by id',
    fe: ['settings/role:detail'],
  })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'put:role/*' })
  @Describe({
    description: 'Modify role',
    fe: ['settings/role:edit'],
  })
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    return this.service.update(param.id, body);
  }

  @MessagePattern({ cmd: 'delete:role/*' })
  @Describe({
    description: 'Delete role',
    fe: ['settings/role:delete'],
  })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.delete(param.id);
  }

  @MessagePattern({ cmd: 'post:mass-assign-role' })
  @Describe({
    description: 'Assign multiple roles to multiple users',
    fe: ['settings/user-role:all'],
  })
  async massAssignRole(@Payload() data: any): Promise<CustomResponse> {
    const body = data.body;
    return this.service.massAssignRole(body);
  }
}
