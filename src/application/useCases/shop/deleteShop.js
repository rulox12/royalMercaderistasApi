const ShopRepository = require('../../../infrastructure/persistence/repositories/ShopRepository');

class DeleteShopUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute(id) {
    const deleteShop = await this.shopRepository.delete(id);
    
    return deleteShop;
  }
}

module.exports = new DeleteShopUseCase(new ShopRepository());