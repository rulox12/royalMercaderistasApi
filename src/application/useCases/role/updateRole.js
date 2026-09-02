const RoleRepository = require('../../../infrastructure/persistence/repositories/RoleRepository');
const { resolveRolePermissions } = require('../../../domain/permissions');

class UpdateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(roleId, data) {
    const updatedFields = {};

    if (data.name !== undefined) {
      updatedFields.name = data.name;
    }

    if (data.description !== undefined) {
      updatedFields.description = data.description;
    }

    if (Array.isArray(data.permissions) || data.name !== undefined) {
      updatedFields.permissions = resolveRolePermissions({
        name: data.name,
        permissions: data.permissions,
      });
    }

    return this.roleRepository.update(roleId, updatedFields);
  }
}

module.exports = new UpdateRoleUseCase(new RoleRepository());