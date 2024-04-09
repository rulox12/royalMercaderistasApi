const BigOrderModel = require("../models/BigOrderModel");
const OrderDetailModel = require("../models/OrderDetailsModel");
const OrderModel = require("../models/OrderModel");

class StatisticsRepository {
  async totalSales() {
    const orderDetails = await OrderDetailModel.find({ VENT: { $exists: true, $ne: '' } }).populate('product').populate({
      path: "order",
      populate: {
        path: "shop",
      }
    });

    let total = 0;

    orderDetails.forEach(detail => {
      total += parseInt(detail.VENT);
    });

    return total;
  }

  async totalBreakdowns() {
    const orderDetails = await OrderDetailModel.find({ AVER: { $exists: true, $ne: '' } }).populate('product').populate({
      path: "order",
      populate: {
        path: "shop",
      }
    });

    let total = 0;

    orderDetails.forEach(detail => {
      total += parseInt(detail.AVER);
    });

    return total;
  }

  async totalOrders(){
    const total = await OrderModel.countDocuments()
    return total;
  }

  async totalBigOrders(){
    const total = await BigOrderModel.countDocuments()
    return total;
  }
}

module.exports = StatisticsRepository;