import { z } from 'zod';
export class CreateRoleRequest {
  name: string;

  constructor(data: { name: string }) {
    this.name = data.name;
  }

  static schema() {
    return z.object({
      name: z.string().min(3),
    });
  }
}
