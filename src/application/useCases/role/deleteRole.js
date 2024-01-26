const RoleRepository = require('../../../infrastructure/persistence/repositories/RoleRepository');

class DeleteRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id) {
    const deleteRole = await this.roleRepository.delete(id);
    return deleteRole;
  }
}

module.exports = new DeleteRoleUseCase(new RoleRepository());