import { z } from 'zod';

export class CreateStoreRequest {
  id: string;
  name: string;
  company_id: string;

  constructor({ id, name, company_id }) {
    this.id = id;
    this.name = name;
    this.company_id = company_id;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255),
      company_id: z.string().uuid(),
    });
  }
}
