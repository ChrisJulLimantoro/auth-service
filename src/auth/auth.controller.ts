import { Controller } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: LoginRequest) {
    return this.authService.login(data);
  }
}
