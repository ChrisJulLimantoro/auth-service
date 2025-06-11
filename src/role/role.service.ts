import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { ValidationService } from '../validation/validation.service';
import { BaseService } from '../base.service';
import { CreateRoleRequest } from './dto/create-role-request.dto';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { UpdateRoleRequest } from './dto/update-role-request.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService extends BaseService {
  // Explicitly define the repository for RoleService
  protected repository = this.roleRepository;
  protected createSchema = CreateRoleRequest.schema();
  protected updateSchema = UpdateRoleRequest.schema(); // the update logic and boundaries is the same as create request

  constructor(
    private readonly roleRepository: RoleRepository, // Inject RoleRepository
    protected readonly validation: ValidationService,
    private readonly prisma: PrismaService,
  ) {
    super(validation); // Pass the validation service to the parent constructor
  }

  protected transformCreateData(data: any) {
    return new CreateRoleRequest(data);
  }

  protected transformUpdateData(data: any) {
    return new UpdateRoleRequest(data);
  }

  async create(data: any, user_id?: string): Promise<CustomResponse> {
    // Call the parent create method
    if (data.store_id == '') {
      data.store_id = null;
      const createData = this.transformCreateData(data);
      const validated = this.validation.validate(createData, this.createSchema);
      const created = await this.roleRepository.create(validated, user_id);
      if (created) {
        return CustomResponse.success(
          'Role created successfully',
          [created],
          201,
        );
      }
    }

    var createdData = [];
    const stores = data.store_id;
    for (const store of stores) {
      const formData = { ...data, store_id: store };
      const createData = this.transformCreateData(formData);
      const validated = this.validation.validate(createData, this.createSchema);
      const created = await this.roleRepository.create(validated, user_id);
      if (created) {
        createdData.push(created);
      }
    }
    return CustomResponse.success(
      `${createdData.length} roles created successfully`,
      createdData,
      201,
    );
  }

  async createReplica(data: any): Promise<CustomResponse> {
    try {
      for (const d of data) {
        super.createReplica(d);
      }
    } catch (e) {
      console.error('Error creating replica:', e);
      return CustomResponse.error(
        'Failed to create replica for roles',
        null,
        500,
      );
    }
    return CustomResponse.success('Roles created successfully', null, 201);
  }

  async update(
    id: string,
    data: any,
    user_id?: string,
  ): Promise<CustomResponse> {
    if (data.store_id == '') {
      data.store_id = null;
    }
    return super.update(id, data, user_id);
  }

  async getRolesByUser(user_id: string) {
    const roles = await this.roleRepository.getRolesByUser(user_id);
    return CustomResponse.success('Roles found', roles, 200);
  }

  async getUsersByRole(role_id: string) {
    const users = await this.roleRepository.getUsersByRole(role_id);
    return CustomResponse.success('Users found', users, 200);
  }

  async assignRole(body: any, created_by?: string) {
    const { user_id, role_id } = body;
    const created = await this.roleRepository.assignRoleToUser(
      user_id,
      role_id,
      created_by,
    );
    return CustomResponse.success('Role assigned to user', created, 200);
  }

  async unassignRole(body: any, created_by?: string) {
    const { user_id, role_id } = body;
    const deleted = await this.roleRepository.unassignRoleToUser(
      user_id,
      role_id,
      created_by,
    );
    return CustomResponse.success('Role unassigned to user', deleted, 200);
  }

  async massAssignRole(body: any, created_by?: string) {
    const { selecting, user_ids, role_ids } = body;
    var createdData = [];
    var deletedData = [];
    if (selecting == 1) {
      const excisting = await this.roleRepository.getRolesByUser(user_ids[0]);
      for (const role_id of role_ids) {
        if (excisting.some((role) => role.role_id == role_id)) continue;
        if (role_id == '') continue;
        const created = await this.roleRepository.assignRoleToUser(
          user_ids[0],
          role_id,
          created_by,
        );
        if (created) {
          createdData.push(created);
        }
      }
      for (const role of excisting) {
        if (role_ids.some((role_id) => role.role_id == role_id)) continue;
        const deleted = await this.roleRepository.unassignRoleToUser(
          user_ids[0],
          role.role_id,
          created_by,
        );
        if (deleted) {
          deletedData.push(deleted);
        }
      }
    } else {
      const excisting = await this.roleRepository.getUsersByRole(role_ids[0]);
      for (const user_id of user_ids) {
        if (excisting.some((user) => user.user_id == user_id)) continue;
        if (user_id == '') continue;
        const created = await this.roleRepository.assignRoleToUser(
          user_id,
          role_ids[0],
          created_by,
        );
        if (created) {
          createdData.push(created);
        }
      }
      for (const user of excisting) {
        if (user_ids.some((user_id) => user.user_id == user_id)) continue;
        const deleted = await this.roleRepository.unassignRoleToUser(
          user.user_id,
          role_ids[0],
          created_by,
        );
        if (deleted) {
          deletedData.push(deleted);
        }
      }
    }

    return CustomResponse.success(
      selecting === 1
        ? `${createdData.length} roles assigned to user, ${deletedData.length} roles unassigned`
        : `${createdData.length} users assigned to role, ${deletedData.length} users unassigned`,
      {
        created: createdData,
        deleted: deletedData,
      },
      200,
    );
  }

  async massAssignRoleReplica(data: any, created_by?: string) {
    console.log(data);
    var createdData = data['created'];
    var deletedData = data['deleted'];

    try {
      // sync process
      for (const created of createdData) {
        await this.roleRepository.assignRoleToUserReplica(created, created_by);
      }

      for (const deleted of deletedData) {
        await this.roleRepository.unassignRoleToUserReplica(
          deleted,
          created_by,
        );
      }
    } catch (e) {
      console.error('Error creating replica:', e);
      return CustomResponse.error(
        'Failed to create replica for roles',
        null,
        500,
      );
    }

    return CustomResponse.success('Data replicated successfully', null, 200);
  }
}
