const User = require("../../../domain/models/User");
const RoleRepository = require("../../../infrastructure/persistence/repositories/RoleRepository");
const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");
const bcrypt = require("bcrypt");

class CreateUserUseCase {
  constructor(userRepository, roleRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  async execute(documentType, document, name, surname, email, phone, password, roleId) {
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new Error("Rol no encontrado");
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("El correo electrónico ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User(null, documentType, document, name, surname, email, phone, true, hashedPassword, role._id);
    const createdUser = await this.userRepository.create(user);

    return createdUser;
  }
}

module.exports = new CreateUserUseCase(new UserRepository(), new RoleRepository());
