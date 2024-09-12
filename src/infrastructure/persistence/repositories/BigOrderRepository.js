const BigOrderModel = require("../models/BigOrderModel");
const mongoose = require('mongoose');

class BigOrderRepository {
  async create(bigOrder) {
    const newBigOrder = new BigOrderModel(bigOrder);
    await newBigOrder.save();

    return newBigOrder.toObject();
  }

  async findById(orderId) {
    return BigOrderModel.findById(orderId).exec();
  }

  async findByDate(date, cityId, platformId) {
    return BigOrderModel.findOne({ date, cityId, platformId }).exec();
  }

  async find(filters) {
    return BigOrderModel.findOne(filters).exec();
  }

  async getAll() {
    try {
      return await BigOrderModel.find({
        cityId: {$exists: true, $ne: null},
        platformId: {$exists: true, $ne: null},
      })
          .populate('cityId')
          .populate('platformId');
    } catch (error) {
      throw new Error(`Error while fetching big orders: ${error.message}`);
    }
  }
  
  async getOrderByDateAndShop(date, shop) {
    if (!mongoose.Types.ObjectId.isValid(shop)) {
      return null;
    }

    return OrderModel.findOne({ date, shop })
  }

  async getOrdersByDate(date) {
    try {
      const orders = await BigOrderModel.find({date});
      return orders;
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
    }
  }
}

module.exports = BigOrderRepository;