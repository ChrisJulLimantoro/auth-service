import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class FeatureRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      roles: { include: { role: true } },
    };
    super(prisma, 'feature', relations); // 'role' is the Prisma model name
  }

  // function to assign feature to role
  async assignFeatureToRole(roleId: string, featureId: string) {
    return this.prisma.featureRole.create({
      data: {
        role_id: roleId,
        feature_id: featureId,
      },
    });
  }

  async unassignFeatureToRole(roleId: string, featureId: string) {
    return this.prisma.featureRole.deleteMany({
      where: {
        AND: [{ role_id: roleId }, { feature_id: featureId }],
      },
    });
  }
}
