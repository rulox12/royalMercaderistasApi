const Shop = require("../../../domain/models/Shop");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class CreateShopUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute(shopData) {
    const { shopNumber, name, address, manager, phone, boss, bossPhone, platformId, cityId, listId, userId } = shopData;

    const existingShop = await this.shopRepository.findByShopNumber(shopNumber);
    if (existingShop) {
      throw new Error("El local ya existe");
    }

    const newShop = new Shop(null, shopNumber, name, address, manager, phone, boss, bossPhone, platformId, cityId, listId, userId);
    return await this.shopRepository.create(newShop);
  }
}

module.exports = new CreateShopUseCase(new ShopRepository());
