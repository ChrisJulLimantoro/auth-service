import { UUID } from 'crypto';
import { z } from 'zod';
export class CreateUserRequest {
  id: string;
  email: string;
  password: string;
  is_owner: boolean;
  owner_id: string | null;

  constructor({ id, email, password, is_owner, owner_id }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.is_owner = is_owner;
    this.owner_id = owner_id;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      password: z.string().min(10),
      is_owner: z.boolean().optional().default(false),
      owner_id: z.string().uuid().optional().nullable(),
    });
  }
}
