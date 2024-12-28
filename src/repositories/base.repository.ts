import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class BaseRepository<T> {
  constructor(
    protected prisma: PrismaService,
    private modelName: string,
    protected relations: Record<string, any>,
  ) {}

  // Create a new record with possible relations
  async create(data: any): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
      include: this.relations,
    });
  }

  // Get all records with possible relations
  async findAll(): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      include: this.relations,
    });
  }

  // Find a record by ID with possible relations
  async findOne(id: string): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
      include: this.relations,
    });
  }

  // Update a record with possible relations
  async update(id: string, data: any): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
      include: this.relations,
    });
  }

  // Delete a record by ID
  async delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }
}
