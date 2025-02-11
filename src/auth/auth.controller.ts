import { Controller } from '@nestjs/common';
import { LoginRequest } from './dto/login-request.dto';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Exempt } from 'src/decorator/exempt.decorator';
import { Describe } from 'src/decorator/describe.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @MessagePattern({ cmd: 'login' })
  @Exempt()
  async login(@Payload() data: LoginRequest) {
    console.log('Login request received');
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'authorize' })
  @Exempt()
  async authorize(@Payload() data: string) {
    return this.authService.authorize(data);
  }

  @MessagePattern({ cmd: 'get:pages-available' })
  @Exempt()
  async getPagesAvailable(@Payload() data: any) {
    return this.authService.getPagesAvailable(data);
  }

  @MessagePattern({ cmd: 'get:authorized-store' })
  @Describe({
    description: 'Get authorized store',
    fe: ['settings/change-store:all'],
  })
  async getAuthorizedStore(@Payload() data: any) {
    const id = data.params.user.id;
    console.log(id);
    return this.authService.getAuthorizedStore(id);
  }
}
