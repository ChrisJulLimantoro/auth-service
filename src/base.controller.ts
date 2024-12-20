// src/controllers/base.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { CustomResponse } from './dto/custom-response.dto';

@Controller('items')
export class BaseController {
  constructor(private readonly baseService: BaseService) {}

  @Post()
  async create(@Body() data: any, @Res() res: any): Promise<Response> {
    const response = await this.baseService.create(data);
    return res.status(response.statusCode).json(response);
  }

  @Get()
  async findAll(@Res() res: any): Promise<Response> {
    const response = await this.baseService.findAll();
    return res.status(response.statusCode).json(response);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() res: any,
  ): Promise<Response | null> {
    const response = await this.baseService.findOne(id);
    return res.status(response.statusCode).json(response);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @Res() res: any,
  ): Promise<Response> {
    const response = await this.baseService.update(id, data);
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: any): Promise<Response> {
    const response = await this.baseService.delete(id);
    return res.status(response.statusCode).json(response);
  }
}
