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
import { RmqAckHelper } from '../helper/rmq-ack.helper';

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

  @EventPattern({ cmd: 'employee_created' })
  @Exempt()
  async employeeCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(context, async () => {
      return await this.userService.createUser(data);
    })();
  }

  @EventPattern({ cmd: 'employee_deleted' })
  @Exempt()
  async employeeDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(context, async () => {
      return await this.userService.deleteUser(data);
    })();
  }

  @EventPattern({ cmd: 'owner_created' })
  @Exempt()
  async ownerCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(context, async () => {
      data.is_owner = true;
      return await this.userService.createUser(data);
    })();
  }

  @EventPattern({ cmd: 'owner_deleted' })
  @Exempt()
  async ownerDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(context, async () => {
      return await this.userService.deleteUser(data);
    })();
  }

  @EventPattern({ cmd: 'owner_updated' })
  @Exempt()
  async ownerUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = this.sanitizeData(data);
    await RmqAckHelper.handleMessageProcessing(context, async () => {
      return await this.userService.updateUser(data.id, sanitizedData);
    })();
  }

  @EventPattern({ cmd: 'employee_updated' })
  @Exempt()
  async employeeUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = this.sanitizeData(data);
    await RmqAckHelper.handleMessageProcessing(context, async () => {
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
      this.masterClient.emit({ cmd: 'password_changed' }, res.data);
    }
    return res;
  }
}
