const RoleRepository = require('../../../infrastructure/persistence/repositories/RoleRepository');
const Role = require('../../../domain/models/Role');

class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(name, description) {
    const role = new Role(null, name, description);
    const createdRole = await this.roleRepository.create(role);
    return createdRole;
  }
}

module.exports = new CreateRoleUseCase(new RoleRepository());