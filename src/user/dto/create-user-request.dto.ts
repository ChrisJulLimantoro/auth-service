import { UUID } from 'crypto';
import { z } from 'zod';
export class CreateUserRequest {
  id: string;
  email: string;
  password: string;

  constructor(data: { id: string; email: string; password: string }) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
  }

  static schema() {
    return z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      password: z.string().min(10),
    });
  }
}
