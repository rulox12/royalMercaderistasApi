const RoleRepository = require('../../../infrastructure/persistence/repositories/RoleRepository');
const Role = require('../../../domain/models/Role');
const { resolveRolePermissions } = require('../../../domain/permissions');

class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(name, description, permissions = []) {
    const role = new Role(null, name, description, resolveRolePermissions({ name, permissions }));
    const createdRole = await this.roleRepository.create(role);
    return createdRole;
  }
}

module.exports = new CreateRoleUseCase(new RoleRepository());