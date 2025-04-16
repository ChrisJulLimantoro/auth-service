import { z } from 'zod';
export class CreateRoleRequest {
  name: string;
  company_id: string;
  store_id: string | null;
  owner_id: string;

  constructor(data: {
    name: string;
    company_id: string;
    store_id: string;
    owner_id: string;
  }) {
    this.name = data.name;
    this.company_id = data.company_id;
    this.store_id = data.store_id;
    this.owner_id = data.owner_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(3),
      company_id: z.string().uuid(),
      store_id: z.string().uuid().nullable().optional(),
      owner_id: z.string().uuid(),
    });
  }
}
