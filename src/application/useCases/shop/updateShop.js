const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class UpdateShopUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute(shopId, shopData) {
    const { shopNumber, name, address, manager, phone, boss, bossPhone, platformId, cityId, listId, userId } = shopData;
    const existingShop = await this.shopRepository.findByShopNumber(shopNumber);
    if (!existingShop) {
      throw new Error("La tienda no existe");
    }

    const newShop = new Shop(shopId, shopNumber, name, address, manager, phone, boss, bossPhone, platformId, cityId, listId, userId);
    return this.shopRepository.update(shopId, newShop);
  }
}

module.exports = new UpdateShopUseCase(ShopRepository);
