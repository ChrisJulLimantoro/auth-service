import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      features: { include: { feature: true } },
    };
    super(prisma, 'role', relations); // 'role' is the Prisma model name
  }
}
