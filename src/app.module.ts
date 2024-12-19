import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ValidationModule } from './validation/validation.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [UserModule, ValidationModule.forRoot(), PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
