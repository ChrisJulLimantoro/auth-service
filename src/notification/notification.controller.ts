import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Exempt } from '../decorator/exempt.decorator';

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

  @EventPattern({ cmd: 'transaction_created' })
  @Exempt()
  async transactionCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('📥 Received transaction_created event:', data);
    await this.handleEvent(
      context,
      () => this.notificationService.sendNotif(data),
      'Error processing employee_created event',
    );
  }
}
