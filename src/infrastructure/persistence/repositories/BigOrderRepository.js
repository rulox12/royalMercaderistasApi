const BigOrderModel = require("../models/BigOrderModel");
const mongoose = require('mongoose');
const OrderModel = require("../models/OrderModel");

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

  async getAll(filters, page = 1, limit = 30) {
    try {
      const skip = (page - 1) * limit;

      const bigOrders = await BigOrderModel.find(filters)
          .sort({ date: -1, _id: 1 })
          .skip(skip)
          .limit(limit)
          .populate('cityId')
          .populate('platformId');

      const totalBigOrders = await BigOrderModel.countDocuments(filters);

      return {
        bigOrders,
        totalBigOrders,
        totalPages: Math.ceil(totalBigOrders / limit),
        currentPage: page,
      };
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