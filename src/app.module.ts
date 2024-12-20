import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ValidationModule } from './validation/validation.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [UserModule, ValidationModule.forRoot(), PrismaModule, AuthModule, RoleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
