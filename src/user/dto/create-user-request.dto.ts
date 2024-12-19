import { z } from 'zod';
export class CreateUserRequest {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }

  static schema() {
    return z.object({
      email: z.string().email(),
      password: z.string().min(10),
    });
  }
}
