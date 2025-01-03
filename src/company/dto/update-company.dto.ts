import { z } from 'zod';

export class UpdateCompanyRequest {
  name: string;
  updated_at: Date;

  constructor({ name, updated_at }) {
    this.name = name;
    this.updated_at = updated_at.toDate();
  }

  static schema() {
    return z.object({
      name: z.string().min(3).max(255),
      updated_at: z.date(),
    });
  }
}
