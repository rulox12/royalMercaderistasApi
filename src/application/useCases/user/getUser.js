const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");

class GetUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId) {
    return this.userRepository.findById(userId);
  }
}

module.exports = new GetUserUseCase(new UserRepository);
