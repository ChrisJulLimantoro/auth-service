import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { CompanyService } from './company.service';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqAckHelper } from 'src/helper/rmq-ack.helper'; // Import the retry handler

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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
      if (!response.success) throw new Error('Company deletion failed');
    })();
  }

  @EventPattern({ cmd: 'company_updated' })
  @Exempt()
  async companyUpdated(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Company Updated emit received', data);
    const sanitizedData = { code: data.code, name: data.name };

    await RmqAckHelper.handleMessageProcessing(context, async () => {
      const response = await this.companyService.update(data.id, sanitizedData);
      if (!response.success) throw new Error('Company update failed');
    })();
  }
}
