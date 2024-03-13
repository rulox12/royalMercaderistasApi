const ShopModel = require("../models/ShopModel");

class ShopRepository {
  async create(shop) {
    const newShop = new ShopModel(shop);
    await newShop.save();

    return newShop.toObject();
  }

  async findById(shopId) {
    return ShopModel.findById(shopId).exec();
  }

  async findByShopNumber(shopNumber) {
    return ShopModel.findOne({ shopNumber }).exec();
  }

  async getAll(filters) {
    try {
      const shops = await ShopModel.find(filters).populate(['userId','cityId', 'listId']);
      return shops;
    } catch (error) {
      throw new Error(`Error while fetching shops: ${error.message}`);
    }
  }

  async update(shopId, updatedFields) {
    try {
      const updateShop = await ShopModel.findByIdAndUpdate(
        shopId,
        updatedFields,
        { new: true }
      );

      return updateShop;
    } catch (error) {
      throw new Error(`Error while updating shop: ${error.message}`);
    }
  }

  async delete(shopId) {
    try {
      const shopDelete = await ShopModel.findByIdAndDelete(shopId);
      return shopDelete;
    } catch (error) {
      throw new Error(`Error while fetching shops: ${error.message}`);
    }
  }
}

module.exports = ShopRepository;
