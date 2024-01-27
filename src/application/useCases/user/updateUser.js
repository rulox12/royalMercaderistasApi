const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");

class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, updateFields) {
    try {
      const existingUser = await this.userRepository.findById(userId);

      if (!existingUser) {
        throw new Error("Usuario no encontrado");
      }

      Object.assign(existingUser, updateFields);

      const updatedUser = await this.userRepository.update(userId, existingUser);

      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UpdateUserUseCase(new UserRepository());
