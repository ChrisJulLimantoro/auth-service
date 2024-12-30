import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CompanyService } from './company.service';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @EventPattern({ cmd: 'company_created' })
  @Exempt()
  async companyCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company created emit received', data);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      console.log('hello');
      const response = await this.companyService.create(data);
      if (response.success) {
        channel.ack(originalMsg);
      }
    } catch (error) {
      console.error('Error processing company_created event', error.stack);
      channel.nack(originalMsg);
      // Optional: Send the error message to a DLQ (Dead Letter Queue) or retry queue
    }
  }

  @EventPattern({ cmd: 'company_deleted' })
  @Exempt()
  async companyDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company deleted emit received', data);
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const response = await this.companyService.delete(data);
      if (response.success) {
        channel.ack(originalMsg);
      }
    } catch (error) {
      console.error('Error processing company_created event', error.stack);
      channel.nack(originalMsg);
      // Optional: Send the error message to a DLQ (Dead Letter Queue) or retry queue
    }
  }
}
