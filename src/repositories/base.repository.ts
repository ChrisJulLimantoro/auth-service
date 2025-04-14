import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class BaseRepository<T> {
  constructor(
    protected prisma: PrismaService,
    private modelName: string,
    protected relations: Record<string, any>,
    protected isSoftDelete = false,
  ) {}

  // Create a new record with possible relations
  async create(data: any, user_id?: string): Promise<T> {
    const created = await this.prisma[this.modelName].create({
      data,
    });
    await this.actionLog(this.modelName, created.id, 'CREATE', null, user_id);
    return created;
  }

  // Get all records with possible relations and filter criteria
  async findAll(filter?: Record<string, any>): Promise<T[]> {
    const whereConditions: Record<string, any> = {
      ...(this.isSoftDelete ? { deleted_at: null } : {}),
      ...filter, // Add the provided filter conditions
    };

    return this.prisma[this.modelName].findMany({
      where: whereConditions, // Apply dynamic filter along with soft delete condition
      include: this.relations,
    });
  }

  // Find a record by ID with possible relations and filter criteria
  async findOne(id: string, filter?: Record<string, any>): Promise<T | null> {
    const whereConditions: Record<string, any> = {
      ...(this.isSoftDelete ? { id, deleted_at: null } : { id }),
      ...filter, // Add the provided filter conditions
    };

    return this.prisma[this.modelName].findUnique({
      where: whereConditions, // Apply dynamic filter along with soft delete condition
      include: this.relations,
    });
  }

  // Update a record with possible relations
  async update(id: string, data: any, user_id?: string): Promise<T> {
    data.updated_at = new Date();
    const before = await this.prisma[this.modelName].findUnique({
      where: this.isSoftDelete ? { id, deleted_at: null } : { id },
    });
    const updated = await this.prisma[this.modelName].update({
      where: this.isSoftDelete ? { id, deleted_at: null } : { id },
      data,
    });
    const diff = this.getDiff(before, updated);
    await this.actionLog(this.modelName, id, 'UPDATE', diff, user_id);
    return updated;
  }

  // Delete a record by ID
  async delete(id: string, user_id?: string): Promise<T> {
    await this.actionLog(this.modelName, id, 'DELETE', null, user_id);
    if (this.isSoftDelete) {
      return this.prisma[this.modelName].update({
        where: { id },
        data: { deleted_at: new Date(), updated_at: new Date() },
      });
    }
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }

  // Restore a soft deleted record
  async restore(id: string, user_id?: string): Promise<T> {
    await this.actionLog(this.modelName, id, 'RESTORE', null, user_id);
    return this.prisma[this.modelName].update({
      where: { id },
      data: { deleted_at: null, updated_at: new Date() },
    });
  }

  // function for count
  async count(filter?: Record<string, any>): Promise<number> {
    return this.prisma[this.modelName].count({
      where: filter,
    });
  }

  // Add logging
  getDiff(
    before: Record<string, any>,
    after: Record<string, any>,
    excludeKeys: string[] = ['id', 'updatedAt'],
  ) {
    const diff: Record<string, { from: any; to: any }> = {};
    for (const key in after) {
      if (excludeKeys.includes(key)) continue;
      if (before[key] !== after[key]) {
        diff[key] = { from: before[key], to: after[key] };
      }
    }
    return diff;
  }

  async actionLog(
    resource: string,
    resource_id: string,
    event: string,
    diff: any,
    user_id: string,
  ) {
    const log = {
      resource,
      resource_id,
      event,
      diff: JSON.stringify(diff),
      user_id,
    };

    return this.prisma.actionLog.create({
      data: log,
    });
  }

  async sync(data: any[]) {
    const datas = await Promise.all(
      data.map((d) =>
        this.prisma[this.modelName].upsert({
          where: { id: d.id },
          update: d,
          create: d,
        }),
      ),
    );
    return datas;
  }
}
