import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternDiscoveryService } from './discovery/message-pattern-discovery.service';
import { CustomResponse } from './exception/dto/custom-response.dto';

@Controller('app')
export class AppController {
  constructor(private readonly discovery: MessagePatternDiscoveryService) {}
  @MessagePattern({ cmd: 'get_all_routes' })
  async getAllRoutes(): Promise<any> {
    const patterns = await this.discovery.getMessagePatterns();
    console.log(patterns);
    return CustomResponse.success('Pattern Found!', patterns, 200);
  }
}
