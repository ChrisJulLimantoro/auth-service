import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'role'); // 'role' is the Prisma model name
  }
}
