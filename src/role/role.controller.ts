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
  @Describe('Create a new role')
  async create(@Payload() data: any): Promise<CustomResponse> {
    const create = data.body;
    create.owner_id = data.params.user.id;
    return this.service.create(create);
  }

  @MessagePattern({ cmd: 'get:role-user/*' })
  @Describe('Get all roles assigned to a user')
  async getRolesByUser(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.getRolesByUser(param.id);
  }

  @MessagePattern({ cmd: 'get:user-role/*' })
  @Describe('Get all users assigned to a role')
  async getUsersByRole(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.getUsersByRole(param.id);
  }

  @MessagePattern({ cmd: 'get:role' })
  @Describe('Get all roles')
  async findAll(@Payload() data: any): Promise<CustomResponse> {
    const filter = data.body;
    return this.service.findAll(filter);
  }

  @MessagePattern({ cmd: 'get:role/*' })
  @Describe('Get a role by id')
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'put:role/*' })
  @Describe('Modify role')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    return this.service.update(param.id, body);
  }

  @MessagePattern({ cmd: 'delete:role/*' })
  @Describe('Delete role')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.delete(param.id);
  }

  @MessagePattern({ cmd: 'post:assign-role' })
  @Describe('Assign role to user')
  async assignRole(@Payload() data: any): Promise<CustomResponse> {
    const body = data.body;
    return this.service.assignRole(body);
  }

  @MessagePattern({ cmd: 'post:unassign-role' })
  @Describe('Unassign role to user')
  async unassignRole(@Payload() data: any): Promise<CustomResponse> {
    const body = data.body;
    return this.service.unassignRole(body);
  }

  @MessagePattern({ cmd: 'post:mass-assign-role' })
  @Describe('Assign multiple role to multiple users')
  async massAssignRole(@Payload() data: any): Promise<CustomResponse> {
    const body = data.body;
    return this.service.massAssignRole(body);
  }
}
