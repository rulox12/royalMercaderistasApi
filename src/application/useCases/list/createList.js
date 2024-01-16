const List = require("../../../domain/models/List");
const ListRepository = require("../../../infrastructure/persistence/repositories/ListRepository");

class CreateListUseCase {
  constructor(listRepository) {
    this.listRepository = listRepository
  }

  async execute(name, description) {
    const newList = new List(null, name, description);
    const createdList = await this.listRepository.create(newList);

    return createdList;
  }
}

module.exports = new CreateListUseCase(new ListRepository());
