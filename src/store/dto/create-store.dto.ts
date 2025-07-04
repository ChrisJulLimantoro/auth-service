import { z } from 'zod';

export class CreateStoreRequest {
  id: string;
  code: string;
  name: string;
  company_id: string;
  logo: string;

  constructor({ id, name, code, company_id, logo }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.company_id = company_id;
    this.logo = logo;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      name: z.string().min(3).max(255),
      code: z.string().max(5),
      company_id: z.string().uuid(),
      logo: z.string().max(255),
    });
  }
}
