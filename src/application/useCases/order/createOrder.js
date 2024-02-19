const Order = require("../../../domain/models/Order");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class CreateOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(shopId, date, userId, cityId) {
    const newOrder = new Order(null, date, shopId, "Pending", userId, cityId);
    const existOrder = await this.orderRepository.getOrderByDateAndShop(date, shopId);

    if (existOrder) {
      return existOrder
    } else {
      const createdOrder = await this.orderRepository.create(newOrder);
      return createdOrder;
    }
  }
}

module.exports = new CreateOrderUseCase(new OrderRepository());
