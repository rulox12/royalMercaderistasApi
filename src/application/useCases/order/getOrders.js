const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute() {
    return this.orderRepository.getAll();
  }
}

module.exports = new GetOrderUseCase(new OrderRepository());
