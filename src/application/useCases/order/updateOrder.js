const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class UpdateOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(orderId, updatedFields) {
    return this.orderRepository.update(orderId, updatedFields);
  }
}

module.exports = new UpdateOrderUseCase(new OrderRepository());
