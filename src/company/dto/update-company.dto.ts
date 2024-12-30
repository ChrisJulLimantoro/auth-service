import { z } from 'zod';

export class UpdateCompanyRequest {
  name: string;

  constructor({ name, owner_id }) {
    this.name = name;
  }

  static schema() {
    return z.object({
      name: z.string().min(3).max(255),
    });
  }
}
