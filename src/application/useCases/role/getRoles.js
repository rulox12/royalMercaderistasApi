const RoleRepository = require("../../../infrastructure/persistence/repositories/RoleRepository");

class GetRolesUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute() {
    return this.roleRepository.getAllRoles();
  }
}

module.exports = new GetRolesUseCase(new RoleRepository);
