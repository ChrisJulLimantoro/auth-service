import { Injectable } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private repository: UserRepository) {}
  async login(data: LoginRequest) {
    const user = await this.repository.authenticateEmail(data.email);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return CustomResponse.error('Invalid password', null, 400);
    }
    return CustomResponse.success('Login successful', user, 200);
  }
}
