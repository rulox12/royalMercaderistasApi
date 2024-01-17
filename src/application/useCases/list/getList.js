const ListRepository = require("../../../infrastructure/persistence/repositories/ListRepository");

class GetListUseCase {
  constructor(listRepository) {
    this.listRepository = listRepository;
  }

  async execute(listId) {
    return this.listRepository.findById(listId);
  }
}

module.exports = new GetListUseCase(new ListRepository());
