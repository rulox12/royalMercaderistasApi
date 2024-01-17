const ListRepository = require("../../../infrastructure/persistence/repositories/ListRepository");

class GetListUseCase {
  constructor(listRepository) {
    this.listRepository = listRepository;
  }

  async execute() {
    return this.listRepository.getAll();
  }
}

module.exports = new GetListUseCase(new ListRepository());
