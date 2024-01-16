const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository
  }

  async execute(orderId) {
    return this.orderRepository.findById(orderId);
  }
}

module.exports = new GetOrderUseCase(new OrderRepository());
