import { z } from 'zod';
export class UpdateRoleRequest {
  name: string | null;
  company_id: string | null;
  store_id: string | null;

  constructor(data: {
    name: string | null;
    company_id: string | null;
    store_id: string | null;
  }) {
    this.name = data.name;
    this.company_id = data.company_id;
    this.store_id = data.store_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(3),
      company_id: z.string().uuid().nullable().optional(),
      store_id: z.string().uuid().nullable().optional(),
    });
  }
}
