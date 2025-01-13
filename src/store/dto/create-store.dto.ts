import { z } from 'zod';

export class CreateStoreRequest {
  id: string;
  code: string;
  name: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;

  constructor({
    id,
    name,
    code,
    company_id,
    created_at,
    updated_at,
    deleted_at,
  }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.company_id = company_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255),
      code: z.string().max(5),
      company_id: z.string().uuid(),
      created_at: z.date(),
      updated_at: z.date(),
      deleted_at: z.date().nullable(),
    });
  }
}
