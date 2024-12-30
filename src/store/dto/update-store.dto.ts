import { z } from 'zod';

export class UpdateStoreRequest {
  name: string;
  company_id: string;

  constructor({ name, company_id }) {
    this.name = name;
    this.company_id = company_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(3).max(255),
      company_id: z.string().uuid(),
    });
  }
}
