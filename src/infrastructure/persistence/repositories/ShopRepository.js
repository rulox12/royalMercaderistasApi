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

  async getAll() {
    try {
      const shops = await ShopModel.find();
      return shops;
    } catch (error) {
      throw new Error(`Error while fetching shops: ${error.message}`);
    }
  }

  async update(shopId, shop) {
    try {
      const newShop = await ShopModel.findByIdAndUpdate({ id: shopId }, shop);
      return newShop;
    } catch (error) {
      throw new Error(`Error while fetching shops: ${error.message}`);
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
