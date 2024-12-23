import { Injectable } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { UserRepository } from 'src/repositories/user.repository';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';
import { ValidationService } from 'src/validation/validation.service';

@Injectable()
export class AuthService {
  constructor(
    private repository: UserRepository,
    private readonly validation: ValidationService,
  ) {}
  async login(data: LoginRequest) {
    this.validation.validate(data, LoginRequest.schema());
    const user = await this.repository.authenticateEmail(data.email);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return CustomResponse.error('Invalid password', null, 400);
    }
    //TODO: IMPLEMENT MORE USER DATA TO BE RETURNED
    const userData = {
      id: user.id,
      email: user.email,
    };
    return CustomResponse.success('Login successful', userData, 200);
  }
}
