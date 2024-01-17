const ListRepository = require("../../../infrastructure/persistence/repositories/ListRepository");

class UpdateListUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, username, email) {
    return this.userRepository.update(userId, username, email);
  }
}

module.exports = new UpdateListUseCase(ListRepository);
