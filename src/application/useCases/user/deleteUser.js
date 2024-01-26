const UserRepository = require('../../../infrastructure/persistence/repositories/UserRepository');

class DeleteUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id) {
    const deleteUser = await this.userRepository.delete(id);
    
    return deleteUser;
  }
}

module.exports = new DeleteUserUseCase(new UserRepository());