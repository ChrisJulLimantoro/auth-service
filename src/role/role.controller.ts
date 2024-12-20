import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { BaseController } from 'src/base.controller';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { Post, Body, Res } from '@nestjs/common';

@Controller('role')
export class RoleController extends BaseController {
  constructor(private service: RoleService) {
    super(service);
  }

  @Post()
  async create(
    @Body() data: CreateRoleRequest,
    @Res() res: any,
  ): Promise<Response> {
    return super.create(data, res);
  }
}
