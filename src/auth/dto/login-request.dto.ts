import { z } from 'zod';
export class LoginRequest {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }

  static schema() {
    return z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });
  }
}
