const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class GetShopUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute(shopId) {
    return this.shopRepository.findById(shopId);
  }
}

module.exports = new GetShopUseCase(new ShopRepository());
