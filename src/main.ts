import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RPCExceptionFilter } from './exception/rpc-exception.filter';
import * as amqp from 'amqplib';
import { RmqHelper } from './helper/rmq.helper';

async function bootstrap() {
  const tcpService = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { port: 3000 }, // Unique port for this TCP service
    },
  );

  // RabbitMQ Setup queue name
  const queueName = 'auth_service_queue_1';
  // Microservice 2 - RabbitMQ
  const rabbitMQService =
    await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: queueName,
        noAck: false,
        queueOptions: { durable: true },
      },
    });

  tcpService.useGlobalFilters(new RPCExceptionFilter());

  // Setup the topic exchange
  const routingKeys = [
    'employee.*',
    'owner.*',
    'company.*',
    'store.*',
    'password.changed',
    'feature.*',
    'page.*',
    'role.*',
  ];
  await RmqHelper.setupSubscriptionQueue(queueName, routingKeys);
  // Start all services
  await Promise.all([tcpService.listen(), rabbitMQService.listen()]);
}
bootstrap();
