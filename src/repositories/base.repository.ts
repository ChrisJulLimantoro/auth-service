import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class BaseRepository<T> {
  constructor(
    protected prisma: PrismaService,
    private modelName: string,
  ) {}

  // Create a new record with possible relations
  async create(data: any, relations?: any): Promise<T> {
    return this.prisma[this.modelName].create({
      data,
      include: relations, // Dynamically include relationships
    });
  }

  // Get all records with possible relations
  async findAll(relations?: any): Promise<T[]> {
    return this.prisma[this.modelName].findMany({
      include: relations, // Dynamically include relationships
    });
  }

  // Find a record by ID with possible relations
  async findOne(id: string, relations?: any): Promise<T | null> {
    return this.prisma[this.modelName].findUnique({
      where: { id },
      include: relations, // Dynamically include relationships
    });
  }

  // Update a record with possible relations
  async update(id: string, data: any, relations?: any): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data,
      include: relations, // Dynamically include relationships
    });
  }

  // Delete a record by ID
  async delete(id: string): Promise<T> {
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }
}
