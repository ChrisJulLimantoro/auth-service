import { Controller } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { CompanyService } from './company.service';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqHelper } from 'src/helper/rmq.helper'; // Import the retry handler
import { CustomResponse } from 'src/exception/dto/custom-response.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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

  @EventPattern('company.created')
  @Exempt()
  async companyCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
    };

    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        const response = await this.companyService.create(sanitizedData);
        if (!response.success) throw new Error('Company creation failed');
      },
      {
        queueName: 'company_created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.company_created',
      },
    )();
  }

  @EventPattern('company.deleted')
  @Exempt()
  async companyDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company deleted emit received', data);

    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        const response = await this.companyService.delete(data);
        if (!response.success) throw new Error('Company deletion failed');
      },
      {
        queueName: 'company_deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.company_deleted',
      },
    )();
  }

  @EventPattern('company.updated')
  @Exempt()
  async companyUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company Updated emit received', data);
    const sanitizedData = { code: data.code, name: data.name };

    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        const response = await this.companyService.update(
          data.id,
          sanitizedData,
        );
        if (!response.success) throw new Error('Company update failed');
      },
      {
        queueName: 'company_updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.company_updated',
      },
    )();
  }

  @MessagePattern({ cmd: 'get:company/*' })
  @Exempt()
  async findOne(@Payload() data: any) {
    const results = await this.companyService.findOne(data.params.id);
    return CustomResponse.success('Company sync successful', results);
  }

  @EventPattern({ cmd: 'company_sync' })
  @Exempt()
  async companySync(@Payload() data: any, @Ctx() context: RmqContext) {
    await this.handleEvent(
      context,
      () => this.companyService.sync(data),
      'Error processing company_sync event',
    );
  }
}
