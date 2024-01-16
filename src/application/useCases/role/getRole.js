const RoleRepository = require("../../../infrastructure/persistence/repositories/RoleRepository");

class GetRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(roleId) {
    return this.roleRepository.findById(roleId);
  }
}

module.exports = new GetRoleUseCase(new RoleRepository);
