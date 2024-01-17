const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class GetShopsUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute() {
    return this.shopRepository.getAll();
  }
}

module.exports = new GetShopsUseCase(new ShopRepository());
