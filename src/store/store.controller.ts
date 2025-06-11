import { Controller } from '@nestjs/common';
import { StoreService } from './store.service';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
  RpcException,
} from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqHelper } from '../helper/rmq.helper'; // Update path if needed
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('store')
export class StoreController {
  constructor(
    private readonly service: StoreService,
    private readonly prisma: PrismaService,
  ) {}

  private async handleEvent(
    context: RmqContext,
    callback: () => Promise<{ success: boolean }>,
    errorMessage: string,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const response = await callback();
      if (response.success) {
        channel.ack(originalMsg);
      }
    } catch (error) {
      console.error(errorMessage, error.stack);
      channel.nack(originalMsg);
    }
  }

  @EventPattern('store.created')
  @Exempt()
  async storeCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Store created emit received', data);

        const sanitizedData = {
          ...data.data,
          created_at: new Date(data.data.created_at),
          updated_at: new Date(data.data.updated_at),
          deleted_at: data.data.deleted_at
            ? new Date(data.data.deleted_at)
            : null,
        };

        const response = await this.service.create(sanitizedData, data.user);
        if (!response.success) throw new RpcException('Store creation failed');
      },
      {
        queueName: 'store.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store_created',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('store.deleted')
  @Exempt()
  async storeDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Store deleted emit received', data);
        const response = await this.service.delete(data.data, data.user);
        if (!response.success) throw new RpcException('Store deletion failed');
      },
      {
        queueName: 'store.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store_deleted',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('store.updated')
  @Exempt()
  async storeUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Store Updated emit received', data);

        const sanitizedData = {
          code: data.data.code,
          name: data.data.name,
          logo: data.data.logo,
        };

        const response = await this.service.update(
          data.data.id,
          sanitizedData,
          data.user,
        );
        if (!response.success) throw new RpcException('Store update failed');
      },
      {
        queueName: 'store.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store_updated',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern({ cmd: 'store_sync' })
  @Exempt()
  async storeSync(@Payload() data: any, @Ctx() context: RmqContext) {
    await this.handleEvent(
      context,
      () => this.service.sync(data),
      'Error processing store_sync event',
    );
  }
}
