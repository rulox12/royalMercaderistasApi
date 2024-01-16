const ListRepository = require("../../../infrastructure/persistence/repositories/ListRepository");

class GetListProductUseCase {
  constructor(listRepository) {
    this.listRepository = listRepository;
  }

  async execute(listId, populateProduct = false) {
    return this.listRepository.getListProduct(listId, populateProduct);
  }
}

module.exports = new GetListProductUseCase(new ListRepository());
