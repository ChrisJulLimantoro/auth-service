import { UUID } from 'crypto';
import { z } from 'zod';
export class CreateUserRequest {
  id: string;
  email: string;
  password: string;
  is_owner: boolean;

  constructor({ id, email, password, is_owner }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.is_owner = is_owner;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      password: z.string().min(10),
      is_owner: z.boolean().optional().default(false),
    });
  }
}
