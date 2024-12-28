import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class FeatureRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'feature'); // 'role' is the Prisma model name
  }
}
