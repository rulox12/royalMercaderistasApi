const BigOrderModel = require("../models/BigOrderModel");
const mongoose = require('mongoose');

class BigOrderRepository {
  async create(order) {
    const newOrder = new BigOrderModel(order);
    await newOrder.save();

    return newOrder.toObject();
  }

  async findById(orderId) {
    return BigOrderModel.findById(orderId).exec();
  }

  async findByDate(date, cityId) {
    return BigOrderModel.findOne({ date, cityId }).exec();
  }

  async find(date, cityId) {
    return BigOrderModel.findOne({ date, cityId }).exec();
  }

  async getAll() {
    try {
      const bigOrders = await BigOrderModel.find().populate('cityId');
      return bigOrders;
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