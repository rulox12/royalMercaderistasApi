const OrderModel = require("../models/OrderModel");
const mongoose = require('mongoose');

class OrderRepository {
  async create(order) {
    const newOrder = new OrderModel(order);
    await newOrder.save();

    return newOrder.toObject();
  }

  async findById(orderId) {
    return OrderModel.findById(orderId).exec();
  }

  async getAll(filters) {
    try {
      const orders = await OrderModel.find(filters).populate('shop');
      return orders;
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
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
      const orders = await OrderModel.find({date});
      return orders;
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
    }
  }

  async getOrdersByUser(userId) {
    try {
      const orders = await OrderModel.find({userId});
      return orders;
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
    }
  }

  async get(filters) {
    try {
      const orders = await OrderModel.findOne(filters);
      return orders;
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
    }
  }

  async update(orderId, updatedFields) {
    try {
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        updatedFields,
        { new: true }
      );

      return updatedOrder;
    } catch (error) {
      throw new Error(`Error while updating order: ${error.message}`);
    }
  }
}

module.exports = OrderRepository;