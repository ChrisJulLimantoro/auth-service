import { z } from 'zod';

export class CreateCompanyRequest {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;

  constructor({
    id,
    name,
    code,
    owner_id,
    created_at,
    updated_at,
    deleted_at,
  }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.owner_id = owner_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255),
      code: z.string().min(3).max(255),
      owner_id: z.string().uuid(),
      created_at: z.date(),
      updated_at: z.date(),
      deleted_at: z.date().nullable(),
    });
  }
}
