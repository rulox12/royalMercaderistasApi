const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetOrderUseCase {
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  async execute(filters) {
    return this.orderRepository.getAll(filters);
  }
}

module.exports = new GetOrderUseCase(new OrderRepository());
