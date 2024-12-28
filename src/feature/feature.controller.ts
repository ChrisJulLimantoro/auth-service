import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternDiscoveryService } from 'src/discovery/message-pattern-discovery.service';
import { FeatureService } from './feature.service';

@Controller('feature')
export class FeatureController {
  constructor(
    private readonly discovery: MessagePatternDiscoveryService,
    private readonly service: FeatureService,
  ) {}

  @MessagePattern({ cmd: 'sync_feature' })
  syncFeature() {
    const patterns = [];
    // From Auth Services
    const authPatterns = this.discovery.getMessagePatterns();
    authPatterns.map((pattern) => {
      pattern.service = 'auth';
      patterns.push(pattern);
    });
    console.log(patterns);
    return this.service.syncFeature(patterns);
  }
}
