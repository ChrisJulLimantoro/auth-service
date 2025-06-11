import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { FeatureRepository } from 'src/repositories/feature.respository';
import { PageRepository } from 'src/repositories/page.repository';
import { ValidationService } from 'src/validation/validation.service';
import { DiscoveryModule } from '@nestjs/core';
import { MessagePatternDiscoveryService } from 'src/discovery/message-pattern-discovery.service';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [DiscoveryModule, SharedModule],
  controllers: [FeatureController],
  providers: [
    FeatureService,
    FeatureRepository,
    PageRepository,
    ValidationService,
    MessagePatternDiscoveryService,
  ],
})
export class FeatureModule {}
