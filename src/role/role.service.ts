import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { ValidationService } from '../validation/validation.service';
import { BaseService } from '../base.service';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';

@Injectable()
export class RoleService extends BaseService {
  // Explicitly define the repository for RoleService
  protected repository = this.roleRepository;
  protected createSchema = CreateRoleRequest.schema();
  protected updateSchema = CreateRoleRequest.schema(); // the update logic and boundaries is the same as create request

  constructor(
    private readonly roleRepository: RoleRepository, // Inject RoleRepository
    protected readonly validation: ValidationService,
  ) {
    super(validation); // Pass the validation service to the parent constructor
  }

  protected transformCreateData(data: any) {
    return new CreateRoleRequest(data);
  }

  protected transformUpdateData(data: any) {
    return new CreateRoleRequest(data);
  }

  async create(data: any): Promise<CustomResponse> {
    // Call the parent create method
    if (data.store_id == '') {
      data.store_id = null;
      return super.create(data);
    }

    var count = 0;
    const stores = data.store_id;
    for (const store of stores) {
      const formData = { ...data, store_id: store };
      const createData = this.transformCreateData(formData);
      const validated = this.validation.validate(createData, this.createSchema);
      const created = await this.roleRepository.create(validated);
      if (created) count++;
    }
    return CustomResponse.success(
      `${count} roles created successfully`,
      null,
      201,
    );
  }

  async assignRole(body: any) {
    const { user_id, role_id } = body;
    const created = await this.roleRepository.assignRoleToUser(
      user_id,
      role_id,
    );
    return CustomResponse.success('Role assigned to user', created, 200);
  }

  async unassignRole(body: any) {
    const { user_id, role_id } = body;
    const deleted = await this.roleRepository.unassignRoleToUser(
      user_id,
      role_id,
    );
    return CustomResponse.success('Role unassigned to user', deleted, 200);
  }
}
