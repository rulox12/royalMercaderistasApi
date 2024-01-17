const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");

class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, username, email) {
    return this.userRepository.update(userId, username, email);
  }
}

module.exports = new UpdateUserUseCase(UserRepository);
