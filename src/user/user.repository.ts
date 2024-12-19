import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'user'); // 'user' is the Prisma model name
  }

  async createUser(data: any) {
    data.password = await bcrypt.hash(data.password, 10);
    return this.create(data); // Using the base create method
  }

  async authenticateEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
