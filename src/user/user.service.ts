import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserRequest } from './dto/create-user-request.dto';
import { ValidationService } from 'src/validation/validation.service';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
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
    const data = await this.repository.findAll({
      roles: true,
    });
    return CustomResponse.success('Data Fetched!', data);
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
