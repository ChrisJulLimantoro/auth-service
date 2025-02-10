import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';
import { CompanyController } from 'src/company/company.controller';
import { features } from 'process';

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
    // Check if Owner of the Company authorize
    const isOwner = await this.isOwner(userId, companyId);
    if (isOwner) {
      return true;
    }

    console.log(userId, companyId, storeId);
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

    whereConditions.push({
      deleted_at: null,
    });

    const user = await this.prisma.user.count({
      where: {
        id: userId,
        roles: {
          some: {
            role: {
              company_id: companyId,
              OR: [
                {
                  store_id: storeId,
                },
                {
                  store_id: null,
                },
              ],
              deleted_at: null,
              features: {
                some: {
                  feature: {
                    name: cmd,
                  },
                },
              },
            },
          },
        },
      },
    });
    console.log('User authorized:', user);
    console.log('Where Clause', whereConditions);

    return user > 0;
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

  async getPagesAvailable(
    userId: string,
    company_id: string,
    store_id: string | null,
  ) {
    const whereClause: any = {
      AND: [
        {
          users: {
            some: {
              user_id: userId,
            },
          },
        },
        { company_id: company_id },
      ],
    };

    // Add store_id condition only if it's not null
    if (store_id !== null && typeof store_id === 'string') {
      whereClause.AND.push({ OR: [{ store_id }, { store_id: null }] });
    }
    return this.prisma.role.findMany({
      where: whereClause,
      select: {
        pages: {
          select: {
            page: {
              select: {
                path: true,
                action: true,
              },
            },
          },
        },
      },
    });
  }

  async isOwner(userId: string, companyId: string) {
    return this.prisma.company.count({
      where: {
        AND: [
          {
            id: companyId,
          },
          {
            owner_id: userId,
          },
        ],
      },
    });
  }

  async getPages() {
    return this.prisma.page.findMany({
      select: {
        path: true,
        action: true,
      },
    });
  }
}

// SELECT DISTINCT company_id from roles
// WHERE
