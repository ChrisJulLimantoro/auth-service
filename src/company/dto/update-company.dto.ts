import { z } from 'zod';

export class UpdateCompanyRequest {
  code: string | null;
  name: string | null;
  updated_at: Date;

  constructor({ code, name, updated_at }) {
    this.code = code;
    this.name = name;
    this.updated_at = updated_at.toDate();
  }

  static schema() {
    return z.object({
      code: z.string().max(5).optional(),
      name: z.string().min(3).max(255).optional(),
      updated_at: z.date(),
    });
  }
}
