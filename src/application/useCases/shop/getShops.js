const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class GetShopsUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute(filters) {
    return this.shopRepository.getAll(filters);
  }
}

module.exports = new GetShopsUseCase(new ShopRepository());
