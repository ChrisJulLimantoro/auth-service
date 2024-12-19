import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserRequest } from './dto/create-user-request.dto';
import { ValidationService } from 'src/validation/validation.service';
import { CustomResponse } from 'src/http-exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private validation: ValidationService,
  ) {}

  async createUser(data: CreateUserRequest) {
    this.validation.validate(data, CreateUserRequest.schema());
    const newUser = await this.repository.createUser(data);
    return CustomResponse.success('User Created!', newUser);
  }

  async getUsers() {
    const data = await this.repository.findAll();
    return CustomResponse.success('Data Fetched!', data);
  }

  async login(data: CreateUserRequest) {
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

  async getUserById(id: string) {
    const user = await this.repository.findOne(id);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }
    return CustomResponse.success('User found!', user);
  }

  async deleteUser(id: string) {
    const user = await this.repository.findOne(id);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }
    await this.repository.delete(id);
    return CustomResponse.success('User deleted!', user, 200);
  }
}
