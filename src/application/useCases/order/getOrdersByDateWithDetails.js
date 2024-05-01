const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetOrdersByDateWithDetailsUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(date, cityId) {
        const orders = await this.orderRepository.getAll({date, cityId});
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                return { order, details: order.orderDetails };
            })
        );

        return ordersWithDetails;
    }
}

module.exports = new GetOrdersByDateWithDetailsUseCase(new OrderRepository());
