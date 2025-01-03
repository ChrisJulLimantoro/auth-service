import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      features: { include: { feature: true } },
    };
    super(prisma, 'role', relations, true); // 'role' is the Prisma model name
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRole.create({
      data: {
        user_id: userId,
        role_id: roleId,
      },
    });
  }

  async unassignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRole.deleteMany({
      where: {
        AND: [{ user_id: userId }, { role_id: roleId }],
      },
    });
  }
}
