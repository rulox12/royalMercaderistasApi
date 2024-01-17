const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class UpdateOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, shopId, status) {
    return this.orderRepository.update(orderId, shopId, status);
  }
}

module.exports = new UpdateOrderUseCase(new OrderRepository());
