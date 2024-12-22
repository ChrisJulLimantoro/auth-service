import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RPCExceptionFilter } from './exception/rpc-exception.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
    },
  );
  app.useGlobalFilters(new RPCExceptionFilter());

  app.listen();
}
bootstrap();
