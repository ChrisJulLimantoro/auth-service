import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ValidationModule } from './validation/validation.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { MessagePatternDiscoveryService } from './discovery/message-pattern-discovery.service';
import { DiscoveryModule } from '@nestjs/core';
import { AppController } from './app.controller';
import { FeatureModule } from './feature/feature.module';
import { StoreModule } from './store/store.module';
import { CompanyModule } from './company/company.module';
import { SharedModule } from './shared.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    UserModule,
    ValidationModule.forRoot(),
    PrismaModule,
    AuthModule,
    RoleModule,
    DiscoveryModule,
    FeatureModule,
    StoreModule,
    CompanyModule,
    SharedModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [MessagePatternDiscoveryService],
})
export class AppModule {}
