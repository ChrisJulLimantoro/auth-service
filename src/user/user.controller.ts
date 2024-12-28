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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @MessagePattern({ cmd: 'get:user' })
  @Exempt()
  getUsers() {
    return this.userService.getUsers();
  }

  @MessagePattern({ cmd: 'post:user' })
  @Exempt()
  async register(@Payload() data: any) {
    const body = data.body;
    return this.userService.createUser(body);
  }

  @MessagePattern({ cmd: 'get:user/*' })
  @Exempt()
  async getUserById(@Res() res, @Param() params: any) {
    const response = await this.userService.getUserById(params.id);
    return res.status(response.statusCode).json(response);
  }

  @MessagePattern({ cmd: 'delete:user/*' })
  @Exempt()
  async deleteUser(@Res() res, @Param() params: any) {
    const response = await this.userService.deleteUser(params.id);
    return res.status(response.statusCode).json(response);
  }
}
