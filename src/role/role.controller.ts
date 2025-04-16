import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { Post, Body, Res } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { Describe } from 'src/decorator/describe.decorator';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqHelper } from 'src/helper/rmq.helper';

@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @MessagePattern({ cmd: 'post:role' })
  @Describe({ description: 'Create a new role', fe: ['settings/role:add'] })
  async create(@Payload() data: any): Promise<CustomResponse> {
    const create = data.body;
    const response = await this.service.create(create, data.params.user.id);
    if (response.success) {
      RmqHelper.publishEvent('role.created', response.data);
    }
    return response;
  }

  @EventPattern('role.created')
  @Exempt()
  async createReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(context, async () => {
      await this.service.createReplica(data);
    })();
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
    const filter = { owner_id: data.body.owner_id };
    return this.service.findAll(filter);
  }

  @MessagePattern({ cmd: 'get:role/*' })
  @Describe({
    description: 'Get a role by id',
    fe: ['settings/role:detail', 'settings/role:edit'],
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
    const response = await this.service.update(param.id, body, param.user.id);
    if (response.success) {
      RmqHelper.publishEvent('role.updated', {
        data: response.data,
        user: param.user.id,
      });
    }
    return response;
  }

  @EventPattern('role.updated')
  @Exempt()
  async updateReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Role Update Event', data);
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.service.updateReplica(
        data.data.id,
        data.data,
        data.user,
      );
    })();
  }

  @MessagePattern({ cmd: 'delete:role/*' })
  @Describe({
    description: 'Delete role',
    fe: ['settings/role:delete'],
  })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id, param.user.id);
    if (response.success) {
      RmqHelper.publishEvent('role.deleted', {
        data: response.data.id,
        user: param.user.id,
      });
    }
    return response;
  }

  @EventPattern('role.deleted')
  @Exempt()
  async deleteReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Role Delete Event', data);
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.service.delete(data.data, data.user);
    })();
  }

  @MessagePattern({ cmd: 'post:mass-assign-role' })
  @Describe({
    description: 'Assign multiple roles to multiple users',
    fe: ['settings/user-role:all'],
  })
  async massAssignRole(@Payload() data: any): Promise<CustomResponse> {
    const body = data.body;
    const response = await this.service.massAssignRole(
      body,
      data.params.user.id,
    );
    if (response.success) {
      RmqHelper.publishEvent('role.mass-assign', {
        body,
        user: data.params.user.id,
      });
    }
    return response;
  }

  @EventPattern('role.mass-assign')
  @Exempt()
  async massAssignRoleReplica(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('Captured Role Mass Assign Event', data);
    await RmqHelper.handleMessageProcessing(context, async () => {
      const response = await this.service.massAssignRole(data.body, data.user);
      if (!response.success) {
        throw new Error('Failed to assign role');
      }
    });
  }
}
