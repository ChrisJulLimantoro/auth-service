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

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getUsers() {
    return this.userService.getUsers();
  }

  @Post('register')
  async register(@Body() data: CreateUserRequest, @Res() res) {
    const response = await this.userService.createUser(data);
    return res.status(response.statusCode).json(response);
  }

  @Get(':id')
  async getUserById(@Res() res, @Param() params: any) {
    const response = await this.userService.getUserById(params.id);
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  async deleteUser(@Res() res, @Param() params: any) {
    const response = await this.userService.deleteUser(params.id);
    return res.status(response.statusCode).json(response);
  }
}
