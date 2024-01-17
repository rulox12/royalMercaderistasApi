const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");

class GetUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute() {
    return this.userRepository.getAllUsers();
  }
}

module.exports = new GetUserUseCase(new UserRepository);
