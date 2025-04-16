import { Controller, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RoleService } from 'src/role/role.service';
import { Describe } from 'src/decorator/describe.decorator';
import { RmqHelper } from '../helper/rmq.helper';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    @Inject('MASTER') private readonly masterClient: ClientProxy,
  ) {}

  private sanitizeData(data: any): any {
    return { password: data.password };
  }

  @EventPattern('employee.created')
  @Exempt()
  async employeeCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Where is the data ? ', data);
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.userService.createUser(data);
    })();
  }

  @EventPattern('employee.deleted')
  @Exempt()
  async employeeDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.userService.deleteUser(data);
    })();
  }

  @EventPattern('owner.created')
  @Exempt()
  async ownerCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(context, async () => {
      data.is_owner = true;
      return await this.userService.createUser(data);
    })();
  }

  @EventPattern('owner.deleted')
  @Exempt()
  async ownerDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.userService.deleteUser(data);
    })();
  }

  @EventPattern('owner.updated')
  @Exempt()
  async ownerUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = this.sanitizeData(data);
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.userService.updateUser(data.id, sanitizedData);
    })();
  }

  @EventPattern('employee.updated')
  @Exempt()
  async employeeUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = this.sanitizeData(data);
    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.userService.updateUser(data.id, sanitizedData);
    })();
  }

  @EventPattern({ cmd: 'post:change-password' })
  @Describe({
    description: 'Change password',
    fe: ['settings/password-change:all'],
  })
  async changePassword(@Payload() data: any) {
    const id = data.params.user.id;
    const body = data.body;
    console.log('change password', id, body);
    const res = await this.userService.changePassword(id, body);
    if (res.success) {
      RmqHelper.publishEvent('password.changed', res.data);
    }
    return res;
  }

  // Sync from other auth services
  @EventPattern('password.changed')
  @Exempt()
  async passwordChanged(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const sanitizedData = {
      id: data.id,
      password: data.password,
    };

    await RmqHelper.handleMessageProcessing(context, async () => {
      return await this.userService.updateUser(data.id, sanitizedData);
    })();
  }
}
