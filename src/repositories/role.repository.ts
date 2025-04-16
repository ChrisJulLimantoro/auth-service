import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      features: { include: { feature: true } },
      company: true,
      store: true,
      users: true,
    };
    super(prisma, 'role', relations, true); // 'role' is the Prisma model name
  }

  async getRolesByUser(userId: string) {
    return this.prisma.userRole.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  async getUsersByRole(roleId: string) {
    return this.prisma.userRole.findMany({
      where: {
        role_id: roleId,
      },
    });
  }

  async assignRoleToUser(userId: string, roleId: string, created_by?: string) {
    const created = await this.prisma.userRole.create({
      data: {
        user_id: userId,
        role_id: roleId,
      },
    });
    await this.actionLog('user_role', created.id, 'CREATE', null, created_by);
    return created;
  }

  async unassignRoleToUser(
    userId: string,
    roleId: string,
    created_by?: string,
  ) {
    const before = await this.prisma.userRole.findMany({
      where: {
        AND: [{ user_id: userId }, { role_id: roleId }],
      },
    });
    // Log the action before deletion
    await this.actionLog('user_role', before[0].id, 'DELETE', null, created_by);
    const deleted = await this.prisma.userRole.deleteMany({
      where: {
        AND: [{ user_id: userId }, { role_id: roleId }],
      },
    });
    return before[0];
  }

  async assignRoleToUserReplica(data: any, created_by?: string) {
    // check if exist or not
    const exist = await this.prisma.userRole.findFirst({
      where: { id: data.id },
    });

    if (exist) {
      // log the action before update
      await this.actionLog('user_role', exist.id, 'UPDATE', null, created_by);
      return this.prisma.userRole.update({
        where: { id: data.id },
        data: data,
      });
    } else {
      // log the action before create
      await this.actionLog('user_role', data.id, 'CREATE', null, created_by);
      return this.prisma.userRole.create({
        data: data,
      });
    }
  }

  async unassignRoleToUserReplica(data: any, created_by?: string) {
    // Find the record to be deleted
    const record = await this.prisma.userRole.findFirst({
      where: { id: data.id },
    });
    if (record) {
      // Log the action before deletion
      await this.actionLog('user_role', record.id, 'DELETE', null, created_by);
      return this.prisma.userRole.delete({
        where: { id: data.id },
      });
    }
    return null; // or handle the case where the record doesn't exist
  }
}
