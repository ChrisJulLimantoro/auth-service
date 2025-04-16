import { z } from 'zod';
export class CreateRoleRequest {
  id: string | null;
  name: string;
  company_id: string;
  store_id: string | null;
  owner_id: string;

  constructor(data: {
    id: string | null;
    name: string;
    company_id: string;
    store_id: string;
    owner_id: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.company_id = data.company_id;
    this.store_id = data.store_id;
    this.owner_id = data.owner_id;
  }

  static schema() {
    return z.object({
      id: z.string().uuid().nullable(),
      name: z.string().min(3),
      company_id: z.string().uuid(),
      store_id: z.string().uuid().nullable().optional(),
      owner_id: z.string().uuid(),
    });
  }
}
