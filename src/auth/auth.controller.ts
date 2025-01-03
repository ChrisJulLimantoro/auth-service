import { Controller } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @MessagePattern({ cmd: 'login' })
  @Exempt()
  async login(@Payload() data: LoginRequest) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'authorize' })
  @Exempt()
  async authorize(@Payload() data: string) {
    return this.authService.authorize(data);
  }
}
