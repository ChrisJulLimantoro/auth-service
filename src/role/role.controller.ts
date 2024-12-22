import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { Post, Body, Res } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @MessagePattern({ cmd: 'post:role' })
  async create(@Payload() data: any): Promise<CustomResponse> {
    data = data.body;
    return await this.service.create(data);
  }

  @MessagePattern({ cmd: 'get:role' })
  async findAll(): Promise<CustomResponse> {
    return await this.service.findAll();
  }

  @MessagePattern({ cmd: 'get:role/*' })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return await this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'put:role/*' })
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    return await this.service.update(param.id, body);
  }

  @MessagePattern({ cmd: 'delete:role/*' })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return await this.service.delete(param.id);
  }
}
