const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetOrderUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(filters, page, limit, shopId = '') {
        return this.orderRepository.getAll(filters, page, limit, shopId);
    }
}

module.exports = new GetOrderUseCase(new OrderRepository());
