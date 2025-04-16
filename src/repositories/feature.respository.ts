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

  async getSync() {
    const features = await this.prisma.feature.findMany();
    const pages = await this.prisma.page.findMany();
    const featurePages = await this.prisma.pageFeature.findMany();

    const data = {
      features,
      pages,
      featurePages,
    };
    return data;
  }

  // function to assign feature to role
  async assignFeatureToRole(
    roleId: string,
    featureId: string,
    user_id?: string,
  ) {
    const created = await this.prisma.featureRole.create({
      data: {
        role_id: roleId,
        feature_id: featureId,
      },
    });
    await this.actionLog('feature_role', created.id, 'CREATE', null, user_id);
  }

  async unassignFeatureToRole(
    roleId: string,
    featureId: string,
    user_id?: string,
  ) {
    const before = await this.prisma.featureRole.findMany({
      where: {
        AND: [{ role_id: roleId }, { feature_id: featureId }],
      },
    });
    const deleted = await this.prisma.featureRole.deleteMany({
      where: {
        AND: [{ role_id: roleId }, { feature_id: featureId }],
      },
    });
    await Promise.all(
      before.map((item) =>
        this.actionLog('feature_role', item.id, 'DELETE', item, user_id),
      ),
    );
    return deleted;
  }
}
