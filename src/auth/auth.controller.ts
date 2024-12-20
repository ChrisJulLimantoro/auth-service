import { Controller, Post, Body, Res } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async login(@Body() data: LoginRequest, @Res() res) {
    const response = await this.authService.login(data);
    return res.status(response.statusCode).json(response);
  }
}
