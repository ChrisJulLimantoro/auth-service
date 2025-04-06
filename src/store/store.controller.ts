import { Controller } from '@nestjs/common';
import { StoreService } from './store.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqAckHelper } from '../helper/rmq-ack.helper'; // Update path if needed

@Controller('store')
export class StoreController {
  constructor(private readonly service: StoreService) {}

  @EventPattern({ cmd: 'store_created' })
  @Exempt()
  async storeCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Store created emit received', data);

        const sanitizedData = {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
        };

        const response = await this.service.create(sanitizedData);
        if (!response.success) throw new Error('Store creation failed');
      },
      {
        queueName: 'store_created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store_created',
      },
    )();
  }

  @EventPattern({ cmd: 'store_deleted' })
  @Exempt()
  async storeDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Store deleted emit received', data);
        const response = await this.service.delete(data);
        if (!response.success) throw new Error('Store deletion failed');
      },
      {
        queueName: 'store_deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store_deleted',
      },
    )();
  }

  @EventPattern({ cmd: 'store_updated' })
  @Exempt()
  async storeUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqAckHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Store Updated emit received', data);

        const sanitizedData = {
          code: data.code,
          name: data.name,
          logo: data.logo,
        };

        const response = await this.service.update(data.id, sanitizedData);
        if (!response.success) throw new Error('Store update failed');
      },
      {
        queueName: 'store_updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store_updated',
      },
    )();
  }
}
