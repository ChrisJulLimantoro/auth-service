import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatternDiscoveryService } from 'src/discovery/message-pattern-discovery.service';
import { FeatureService } from './feature.service';
import { Describe } from 'src/decorator/describe.decorator';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('feature')
export class FeatureController {
  constructor(
    private readonly discovery: MessagePatternDiscoveryService,
    private readonly service: FeatureService,
  ) {}

  @MessagePattern({ cmd: 'sync_feature' })
  @Exempt()
  syncFeature() {
    const patterns = [];
    // From Auth Services
    const authPatterns = this.discovery.getMessagePatterns();
    authPatterns.map((pattern) => {
      pattern.service = 'auth';
      patterns.push(pattern);
    });
    return this.service.syncFeature(patterns);
  }

  @MessagePattern({ cmd: 'post:assign-feature' })
  @Describe('Assign feature to role')
  assignFeature(@Payload() data: any) {
    const body = data.body;
    return this.service.assignFeature(body);
  }

  @MessagePattern({ cmd: 'post:unassign-feature' })
  @Describe('Unassign feature to role')
  unassignFeature(@Payload() data: any) {
    const body = data.body;
    return this.service.unassignFeature(body);
  }
}
