import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class PageRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {};
    super(prisma, 'page', relations, false); // 'role' is the Prisma model name
  }

  async getAllandRole(role_id: string | undefined) {
    const whereClause = role_id ? { role_id: role_id } : {};
    return this.prisma.page.findMany({
      include: {
        roles: {
          where: whereClause,
        },
      },
      orderBy: {
        path: 'asc',
      },
    });
  }

  async getByRole(role_id: string) {
    return this.prisma.pageRole.findMany({
      where: {
        role_id: role_id,
      },
    });
  }

  async checkAssignedPageToFeature(pageId: string, featureId: string) {
    return (
      (
        await this.prisma.pageFeature.findMany({
          where: {
            AND: [{ page_id: pageId }, { feature_id: featureId }],
          },
        })
      ).length > 0
    );
  }

  async assignPageToFeature(pageId: string, featureId: string) {
    return this.prisma.pageFeature.create({
      data: {
        page_id: pageId,
        feature_id: featureId,
      },
    });
  }

  async unAssignPageToFeature(pageId: string, featureId: string) {
    return this.prisma.pageFeature.deleteMany({
      where: {
        AND: [{ page_id: pageId }, { feature_id: featureId }],
      },
    });
  }

  async assignPageToRole(pageId: string, roleId: string) {
    return this.prisma.pageRole.create({
      data: {
        page_id: pageId,
        role_id: roleId,
      },
    });
  }

  async unassignPageToRole(pageId: string, roleId: string) {
    return this.prisma.pageRole.deleteMany({
      where: {
        AND: [{ page_id: pageId }, { role_id: roleId }],
      },
    });
  }
}
