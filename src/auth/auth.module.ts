import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from 'src/repositories/user.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StoreRepository } from 'src/repositories/store.repository';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [],
  providers: [
    AuthService,
    UserRepository,
    StoreRepository,
    NotificationService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
