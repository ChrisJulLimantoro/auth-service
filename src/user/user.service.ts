import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserRequest } from './dto/create-user-request.dto';
import { ValidationService } from 'src/validation/validation.service';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    private repository: UserRepository,
    private validation: ValidationService,
  ) {}

  async createUser(data: CreateUserRequest) {
    data = new CreateUserRequest(data);
    const validated = this.validation.validate(
      data,
      CreateUserRequest.schema(),
    );
    const newUser = await this.repository.createUser(validated);
    return CustomResponse.success('User Created!', newUser);
  }

  async getUsers() {
    const data = await this.repository.findAll();
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

  async updateUser(id: string, data: any) {
    const user = await this.repository.findOne(id);
    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }
    const updated = await this.repository.update(id, data);
    return CustomResponse.success('User updated!', updated);
  }

  async changePassword(id: string, data: any) {
    const user = await this.repository.findOne(id);

    if (!user) {
      return CustomResponse.error('User not found', null, 404);
    }

    const passwordMatch = await bcrypt.compare(
      data.old_password,
      user.password,
    );
    if (!passwordMatch) {
      return CustomResponse.error('Invalid password', null, 400);
    }

    // check Password
    if (data.new_password.length < 12) {
      return CustomResponse.error(
        'Password must be at least 12 characters long!',
        null,
        400,
      );
    }

    if (data.new_password.search(/[a-z]/) < 0) {
      return CustomResponse.error(
        'Password must contain at least one lowercase character!',
        null,
        400,
      );
    }

    if (data.new_password.search(/[A-Z]/) < 0) {
      return CustomResponse.error(
        'Password must contain at least one uppercase character!',
        null,
        400,
      );
    }

    if (data.new_password.search(/[0-9]/) < 0) {
      return CustomResponse.error(
        'Password must contain at least one digit!',
        null,
        400,
      );
    }

    if (data.new_password === data.old_password) {
      return CustomResponse.error('New password must be different!', null, 400);
    }

    if (data.new_password !== data.confirm_password) {
      return CustomResponse.error('Password Confirmation mismatch!', null, 400);
    }

    const password = await bcrypt.hash(data.new_password, 10);

    const res = await this.repository.update(
      id,
      {
        password: password,
      },
      id,
    );

    return CustomResponse.success('Password changed!', res, 200);
  }
}
