// base.repository.ts
import { PrismaService } from './prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseRepository<T> {
  constructor(
    protected prisma: PrismaService,
    private modelName: string,
  ) {}

  async create(data: any): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
    });
  }

  async findAll(): Promise<T[]> {
    return this.prisma[this.modelName].findMany();
  }

  async findOne(id: string): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
    });
  }

  async update(id: string, data: any): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }
}
