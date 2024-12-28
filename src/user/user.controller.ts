import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequest } from './dto/create-user-request.dto';
import { MessagePattern } from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @MessagePattern('get_users')
  @Exempt()
  getUsers() {
    return this.userService.getUsers();
  }

  @MessagePattern('register')
  @Exempt()
  async register(@Body() data: CreateUserRequest, @Res() res) {
    const response = await this.userService.createUser(data);
    return res.status(response.statusCode).json(response);
  }

  @MessagePattern('get:user/:id')
  @Exempt()
  async getUserById(@Res() res, @Param() params: any) {
    const response = await this.userService.getUserById(params.id);
    return res.status(response.statusCode).json(response);
  }

  @MessagePattern('delete')
  @Exempt()
  async deleteUser(@Res() res, @Param() params: any) {
    const response = await this.userService.deleteUser(params.id);
    return res.status(response.statusCode).json(response);
  }
}
