import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class FeatureRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {};
    super(prisma, 'feature', relations, false); // 'role' is the Prisma model name
  }

  // function to get all features connected to page
  async getAllToPage(page_id: string) {
    return this.prisma.pageFeature.findMany({
      where: {
        page_id: page_id,
      },
    });
  }

  async getByRole(role_id: string) {
    return this.prisma.featureRole.findMany({
      where: {
        role_id: role_id,
      },
    });
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
