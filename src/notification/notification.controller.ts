import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Exempt } from '../decorator/exempt.decorator';
import { RmqHelper } from 'src/helper/rmq.helper';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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

  @EventPattern('transaction.auth.created')
  @Exempt()
  async transactionCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('📥 Received transaction_created event:', data);
    console.log('Captured Cart Create Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        await this.notificationService.sendNotif(data);
      },
      {
        queueName: 'transaction.auth.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.transaction.auth.created',
      },
    )();
  }

  @EventPattern('transaction.auth.settlement')
  @Exempt()
  async transactionSettlement(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('📥 Received transaction_settlement event:', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        await this.notificationService.sendSettlementNotif(data);
      },
      {
        queueName: 'transaction.auth.settlement',
        useDLQ: true,
        dlqRoutingKey: 'dlq.transaction.auth.settlement',
      },
    )();
  }

  @EventPattern('transaction.auth.failed')
  @Exempt()
  async transactionFailed(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('📥 Received transaction_failed event:', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        await this.notificationService.sendFailedNotif(data);
      },
      {
        queueName: 'transaction.auth.failed',
        useDLQ: true,
        dlqRoutingKey: 'dlq.transaction.auth.failed',
      },
    )();
  }
}
