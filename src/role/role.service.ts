import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { ValidationService } from '../validation/validation.service';
import { BaseService } from '../base.service';
import { Role } from '@prisma/client';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { CustomResponse } from 'src/dto/custom-response.dto';

@Injectable()
export class RoleService extends BaseService {
  // Explicitly define the repository for RoleService
  protected repository = this.roleRepository;
  protected createSchema = CreateRoleRequest.schema();

  constructor(
    private readonly roleRepository: RoleRepository, // Inject RoleRepository
    protected readonly validation: ValidationService,
  ) {
    super(validation); // Pass the validation service to the parent constructor
  }

  async create(data: CreateRoleRequest): Promise<CustomResponse> {
    return super.create(data);
  }
}
