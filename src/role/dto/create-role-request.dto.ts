import { z } from 'zod';
export class CreateRoleRequest {
  name: string;
  company_id: string;
  store_id: string | null;

  constructor(data: { name: string; company_id: string; store_id: string }) {
    this.name = data.name;
    this.company_id = data.company_id;
    this.store_id = data.store_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(3),
      company_id: z.string().uuid(),
      store_id: z.string().uuid().nullable().optional(),
    });
  }
}
