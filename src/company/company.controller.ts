import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext, MessagePattern } from '@nestjs/microservices';
import { CompanyService } from './company.service';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqAckHelper } from 'src/helper/rmq-ack.helper'; // Import the retry handler
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

  @EventPattern({ cmd: 'company_created' })
  @Exempt()
  async companyCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const sanitizedData = {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
    };

    await RmqAckHelper.handleMessageProcessing(context, async () => {
      const response = await this.companyService.create(sanitizedData);
      if (!response.success) throw new Error('Company creation failed');
    })();
  }

  @EventPattern({ cmd: 'company_deleted' })
  @Exempt()
  async companyDeleted(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company deleted emit received', data);

    await RmqAckHelper.handleMessageProcessing(context, async () => {
      const response = await this.companyService.delete(data);
      console.log(response, data);
      if (!response.success) throw new Error('Company deletion failed');
    })();
  }

  @EventPattern({ cmd: 'company_updated' })
  @Exempt()
  async companyUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company Updated emit received', data);
    const sanitizedData = { code: data.code, name: data.name };

    await RmqAckHelper.handleMessageProcessing(context, async () => {
      console.log('ini data company',data.id);
      const response = await this.companyService.update(data.id, sanitizedData);
      console.log('response update company',response, console.log(data));
      if (!response.success) throw new Error('Company update failed');
    })();
  }

  @MessagePattern({cmd:'get:company/*'})
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
