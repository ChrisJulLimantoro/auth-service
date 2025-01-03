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
    data.password = await bcrypt.hash(data.password, 10);
    return this.create(data); // Using the base create method
  }

  async authenticateEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
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
        company_id: true,
      },
      where: {
        users: {
          some: {
            user_id: userId,
          },
        },
      },
    });
  }

  async getCorrelatedStore(userId: string) {
    return this.prisma.role.findMany({
      select: {
        store_id: true,
      },
      where: {
        users: {
          some: {
            user_id: userId,
          },
        },
      },
    });
  }
}

// SELECT DISTINCT company_id from roles
// WHERE
