const OrderModel = require("../models/OrderModel");

class StatisticsRepository {
  async totalSales() {
    let total = 0;
    const orders = await OrderModel.find();
    
    for (const order of orders) {
      for (const detail of order.orderDetails) {
        if (detail.VENT && detail.VENT !== '') {
          total += parseInt(detail.VENT);
        }
      }
    }

    return total;
  }

  async totalBreakdowns() {
    let total = 0;
    const orders = await OrderModel.find();
    
    for (const order of orders) {
      for (const detail of order.orderDetails) {
        if (detail.AVER && detail.AVER !== '') {
          total += parseInt(detail.AVER);
        }
      }
    }

    return total;
  }

  async totalOrders(){
    const total = await OrderModel.countDocuments();
    return total;
  }

  async totalBigOrders(){
    // No se necesita el modelo BigOrderModel en este caso
    const total = await OrderModel.countDocuments();
    return total;
  }
}

module.exports = StatisticsRepository;
