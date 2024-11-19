const OrderModel = require("../models/OrderModel");

class OrderRepository {
  async create(order) {
    const newOrder = new OrderModel(order);
    await newOrder.save();
    return newOrder;
  }

  async findById(orderId) {
    return OrderModel.findById(orderId).populate('orderDetails.product').exec();
  }

  async getAll(filters, page = 1, limit = 30) {
    try {
      const skip = (page - 1) * limit;
      const orders = await OrderModel.find(filters)
          .sort({ date: -1, _id: 1 })
          .skip(skip)
          .limit(limit)
          .populate('cityId')
          .populate('shop')
          .populate('orderDetails.product');

      const totalOrders = await OrderModel.countDocuments(filters);
      return {
        orders,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
    }
  }

  async getOrderByDateAndShop(date, shop) {
    return OrderModel.findOne({ date, shop }).populate('orderDetails.product').exec();
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
      const orders = await OrderModel.find({ date }).populate('orderDetails.product');
      return orders;
    } catch (error) {
      throw new Error(`Error while fetching orders: ${error.message}`);
    }
  }

  async get(filters) {
    try {
      const orders = await OrderModel.findOne(filters).populate('orderDetails.product');;
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
      ).populate('orderDetails.product').exec();

      return updatedOrder;
    } catch (error) {
      throw new Error(`Error while updating order: ${error.message}`);
    }
  }
  
  async save(order) {
    try {
        const updatedOrder = await order.save();
        return updatedOrder;
    } catch (error) {
        throw new Error(`Error while saving order: ${error.message}`);
    }
}
}

module.exports = OrderRepository;