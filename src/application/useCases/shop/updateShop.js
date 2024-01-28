const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class UpdateShopUseCase {
  constructor(shopRepository) {
    this.shopRepository = shopRepository;
  }

  async execute(shopId, updateFields) {
    try {
      const existingShop = await this.shopRepository.findById(shopId);

      if (!existingShop) {
        throw new Error("Tienda no encontrado");
      }
      
      Object.assign(existingShop, updateFields);

      const updateShop = await this.shopRepository.update(shopId, existingShop);

      return updateShop;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UpdateShopUseCase(new ShopRepository());
