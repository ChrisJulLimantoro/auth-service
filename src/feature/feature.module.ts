import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { FeatureRepository } from 'src/repositories/feature.respository';
import { ValidationService } from 'src/validation/validation.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { DiscoveryModule } from '@nestjs/core';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePatternDiscoveryService } from 'src/discovery/message-pattern-discovery.service';

@Module({
  imports: [DiscoveryModule],
  controllers: [FeatureController],
  providers: [
    FeatureService,
    FeatureRepository,
    ValidationService,
    PrismaService,
    MessagePatternDiscoveryService,
  ],
})
export class FeatureModule {}
