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
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  private sanitizeData(data: any): any {
    return { password: data.password };
  }

  @EventPattern('employee.created')
  @Exempt()
  async employeeCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Where is the data ? ', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.userService.createUser(data.data);
      },
      {
        queueName: 'employee.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.employee.created',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('employee.deleted')
  @Exempt()
  async employeeDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.userService.deleteUser(data.data);
      },
      {
        queueName: 'employee.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.employee.deleted',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('owner.created')
  @Exempt()
  async ownerCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        data.is_owner = true;
        return await this.userService.createUser(data.data);
      },
      {
        queueName: 'owner.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.owner.created',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('owner.deleted')
  @Exempt()
  async ownerDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.userService.deleteUser(data.data);
      },
      {
        queueName: 'owner.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.owner.deleted',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('owner.updated')
  @Exempt()
  async ownerUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = this.sanitizeData(data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.userService.updateUser(data.data.id, sanitizedData);
      },
      {
        queueName: 'owner.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.owner.updated',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('employee.updated')
  @Exempt()
  async employeeUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = this.sanitizeData(data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.userService.updateUser(data.data.id, sanitizedData);
      },
      {
        queueName: 'employee.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.employee.updated',
        prisma: this.prisma,
      },
    )();
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
    const sanitizedData = {
      id: data.id,
      password: data.password,
    };

    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.userService.updateUser(data.id, sanitizedData);
      },
      {
        queueName: 'password.changed',
        useDLQ: true,
        dlqRoutingKey: 'dlq.password.changed',
        prisma: this.prisma,
      },
    )();
  }
}
