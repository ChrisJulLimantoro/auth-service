import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';
import { CompanyController } from 'src/company/company.controller';

@Injectable()
export class UserRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      roles: { include: { role: true } },
    };
    super(prisma, 'user', relations, true); // 'user' is the Prisma model name
  }

  async createUser(data: any) {
    return this.create(data); // Using the base create method
  }

  async authenticateEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
        deleted_at: null,
      },
    });
  }

  async authorize(
    userId: string,
    cmd: string,
    companyId: string | null,
    storeId: string | null,
  ) {
    const whereConditions: any[] = [
      {
        features: {
          some: {
            feature: {
              name: cmd,
            },
          },
        },
      },
    ];

    if (companyId !== null) {
      whereConditions.push({
        company_id: companyId,
      });
    }

    if (storeId !== null) {
      whereConditions.push({
        store_id: storeId,
      });
    }

    whereConditions.push({
      deleted_at: null,
    });

    return this.prisma.user.count({
      where: {
        id: userId,
        roles: {
          some: {
            role: {
              AND: whereConditions,
            },
          },
        },
      },
    });
  }

  async getCorrelatedCompany(userId: string) {
    return this.prisma.role.findMany({
      select: {
        company: true,
      },
      where: {
        users: {
          some: {
            user_id: userId,
          },
        },
        deleted_at: null,
      },
    });
  }

  async getCorrelatedStore(userId: string) {
    return this.prisma.role.findMany({
      select: {
        store: true,
      },
      where: {
        users: {
          some: {
            user_id: userId,
          },
        },
        deleted_at: null,
      },
    });
  }

  async getOwnedCompany(userId: string) {
    return this.prisma.company.findMany({
      where: {
        owner_id: userId,
        deleted_at: null,
      },
    });
  }

  async getOwnedStore(userId: string) {
    return this.prisma.store.findMany({
      where: {
        company: {
          owner_id: userId,
        },
        deleted_at: null,
      },
    });
  }
}

// SELECT DISTINCT company_id from roles
// WHERE
