import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { MessagePatternDiscoveryService } from 'src/discovery/message-pattern-discovery.service';
import { FeatureService } from './feature.service';
import { Describe } from 'src/decorator/describe.decorator';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqHelper } from 'src/helper/rmq.helper';

@Controller('feature')
export class FeatureController {
  constructor(
    private readonly discovery: MessagePatternDiscoveryService,
    private readonly service: FeatureService,
    @Inject('MASTER') private readonly masterClient: ClientProxy,
    @Inject('FINANCE') private readonly financeClient: ClientProxy,
    @Inject('INVENTORY') private readonly inventoryClient: ClientProxy,
    @Inject('TRANSACTION') private readonly transactionClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'sync_feature' })
  @Exempt()
  async syncFeature() {
    const patterns = [];
    // From Auth Services
    const authPatterns = await this.discovery.getMessagePatterns();
    authPatterns.map((pattern) => {
      patterns.push(pattern);
    });
    // From Master Service
    const masterResponse = await this.masterClient
      .send({ cmd: 'get_routes' }, {})
      .toPromise();
    const masterPatterns = masterResponse.data;
    masterPatterns.map((pattern) => {
      patterns.push(pattern);
    });
    // from Finance Service
    const financePatterns = await this.financeClient
      .send({ cmd: 'get_routes' }, {})
      .toPromise();
    financePatterns.data.map((pattern) => {
      pattern.service = 'finance';
      patterns.push(pattern);
    });
    // from Inventory Service
    const inventoryPatterns = await this.inventoryClient
      .send({ cmd: 'get_routes' }, {})
      .toPromise();
    inventoryPatterns.data.map((pattern) => {
      patterns.push(pattern);
    });
    // from transaction Service
    const transactionPatterns = await this.transactionClient
      .send({ cmd: 'get_routes' }, {})
      .toPromise();
    transactionPatterns.data.map((pattern) => {
      patterns.push(pattern);
    });

    const response = await this.service.syncFeature(patterns);
    // Send to the replica
    RmqHelper.publishEvent('feature.sync', response.data);
    return response;
  }

  // For replica counterpart
  @MessagePattern('feature.sync')
  @Exempt()
  async syncFeatureReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Feature Sync Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        const response = await this.service.syncFeatureReplica(data);
        if (!response.success) {
          throw new Error('Failed to sync feature');
        }
      },
      {
        queueName: 'feature.sync',
        useDLQ: true,
        dlqRoutingKey: 'dlq.feature.sync',
      },
    )();
  }

  @MessagePattern({ cmd: 'get:feature-role' })
  @Describe({
    description: 'Get all feature',
    fe: ['settings/role:add'],
  })
  async findAll(@Payload() data: any) {
    return this.service.getFeatures(null);
  }

  @MessagePattern({ cmd: 'get:feature-role/*' })
  @Describe({
    description: 'Get all feature',
    fe: ['settings/role:edit', 'settings/role:detail'],
  })
  async getFeatureRole(@Payload() data: any) {
    return this.service.getFeatures(data.params.id);
  }

  @MessagePattern({ cmd: 'post:mass-assign-feature' })
  @Describe({
    description: 'Assign multiple features to multiple roles',
    fe: ['settings/role:add', 'settings/role:edit'],
  })
  async massAssignFeature(@Payload() data: any) {
    const body = data.body;
    const response = await this.service.massAssignFeature(
      body,
      data.params.user.id,
    );
    if (response.success) {
      RmqHelper.publishEvent('feature.mass-assign', {
        body,
        user: data.params.user.id,
      });
    }
  }

  @EventPattern('feature.mass-assign')
  @Exempt()
  async massAssignFeatureReplica(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log('Captured Feature Mass Assign Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        const response = await this.service.massAssignFeature(
          data.body,
          data.user,
        );
        if (!response.success) {
          throw new Error('Failed to assign feature');
        }
      },
      {
        queueName: 'feature.mass-assign',
        useDLQ: true,
        dlqRoutingKey: 'dlq.feature.mass-assign',
      },
    )();
  }
}
