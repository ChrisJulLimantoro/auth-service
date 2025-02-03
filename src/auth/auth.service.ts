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
      company_id: 'f6c027b7-1443-47b5-9526-6354c287d6f2',
      store_id: '195d72cf-a8ba-4bba-9b12-f5e742fb6668',
    };
    return CustomResponse.success('Login successful', userData, 200);
  }

  async authorize(data: any) {
    console.log('Authenticating user with request!', data);
    const user = data.userId;
    const cmd = data.cmd;
    const company = data.companyId;
    const store = data.storeId;
    const response = await this.repository.authorize(user, cmd, company, store);
    return response > 0;
  }
}
