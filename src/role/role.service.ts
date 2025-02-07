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

  async getRolesByUser(user_id: string) {
    const roles = await this.roleRepository.getRolesByUser(user_id);
    return CustomResponse.success('Roles found', roles, 200);
  }

  async getUsersByRole(role_id: string) {
    const users = await this.roleRepository.getUsersByRole(role_id);
    return CustomResponse.success('Users found', users, 200);
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

  async massAssignRole(body: any) {
    const { selecting, user_ids, role_ids } = body;
    var countCreated = 0;
    var countDeleted = 0;
    if (selecting == 1) {
      const excisting = await this.roleRepository.getRolesByUser(user_ids[0]);
      for (const role_id of role_ids) {
        if (excisting.some((role) => role.role_id == role_id)) continue;
        if (role_id == '') continue;
        const created = await this.roleRepository.assignRoleToUser(
          user_ids[0],
          role_id,
        );
        if (created) countCreated++;
      }
      for (const role of excisting) {
        if (role_ids.some((role_id) => role.role_id == role_id)) continue;
        const deleted = await this.roleRepository.unassignRoleToUser(
          user_ids[0],
          role.role_id,
        );
        if (deleted) countDeleted++;
      }
    } else {
      const excisting = await this.roleRepository.getUsersByRole(role_ids[0]);
      for (const user_id of user_ids) {
        if (excisting.some((user) => user.user_id == user_id)) continue;
        if (user_id == '') continue;
        const created = await this.roleRepository.assignRoleToUser(
          user_id,
          role_ids[0],
        );
        if (created) countCreated++;
      }
      for (const user of excisting) {
        if (user_ids.some((user_id) => user.user_id == user_id)) continue;
        const deleted = await this.roleRepository.unassignRoleToUser(
          user.user_id,
          role_ids[0],
        );
        if (deleted) countDeleted++;
      }
    }
    return CustomResponse.success(
      selecting === 1
        ? `${countCreated} roles assigned to user, ${countDeleted} roles unassigned`
        : `${countCreated} users assigned to role, ${countDeleted} users unassigned`,
      null,
      200,
    );
  }
}
