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

  async assignPageToFeature(
    pageId: string,
    featureId: string,
    user_id?: string,
  ) {
    const created = await this.prisma.pageFeature.create({
      data: {
        page_id: pageId,
        feature_id: featureId,
      },
    });
    return created;
  }

  async unAssignPageToFeature(
    pageId: string,
    featureId: string,
    user_id?: string,
  ) {
    const before = await this.prisma.pageFeature.findMany({
      where: {
        AND: [{ page_id: pageId }, { feature_id: featureId }],
      },
    });
    const deleted = await this.prisma.pageFeature.deleteMany({
      where: {
        AND: [{ page_id: pageId }, { feature_id: featureId }],
      },
    });
    return deleted;
  }

  async assignPageToRole(pageId: string, roleId: string, user_id?: string) {
    const created = await this.prisma.pageRole.create({
      data: {
        page_id: pageId,
        role_id: roleId,
      },
    });
    await this.actionLog('page_role', created.id, 'CREATE', null, user_id);
    return created;
  }

  async unassignPageToRole(pageId: string, roleId: string, user_id?: string) {
    const before = await this.prisma.pageRole.findMany({
      where: {
        AND: [{ page_id: pageId }, { role_id: roleId }],
      },
    });
    if (before.length > 0) {
      await this.prisma.pageRole.deleteMany({
        where: {
          AND: [{ page_id: pageId }, { role_id: roleId }],
        },
      });

      await Promise.all(
        before.map((item) =>
          this.actionLog('page_role', item.id, 'DELETE', item, user_id),
        ),
      );
    }
    return before;
  }

  async assignPageToRoleReplica(data: any, user_id?: string) {
    // check if exist or not
    const exist = await this.prisma.pageRole.findFirst({
      where: { id: data.id },
    });

    if (!exist) {
      // log the action before create
      await this.actionLog('page_role', data.id, 'CREATE', null, user_id);
      return this.prisma.pageRole.create({
        data: data,
      });
    }
  }

  async unassignPageToRoleReplica(data: any, user_id?: string) {
    // check if exist or not
    const exist = await this.prisma.pageRole.findFirst({
      where: { id: data.id },
    });

    if (exist) {
      // log the action before update
      await this.actionLog('page_role', exist.id, 'DELETE', null, user_id);
      return this.prisma.pageRole.delete({
        where: { id: data.id },
      });
    }
  }
}
