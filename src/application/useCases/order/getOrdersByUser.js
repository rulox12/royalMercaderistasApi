const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetOrdersByUserUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(userId) {
        const orders = await this.orderRepository.getOrdersByUser(userId);
        console.log(orders);
    }
}

module.exports = new GetOrdersByUserUseCase(new OrderRepository());
