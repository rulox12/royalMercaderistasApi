const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetManyOrdersUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(dates, shopId) {
        const ordersWithDetails = [];

        for (const date of dates) {
            const order = await this.orderRepository.getOrderByDateAndShop(date, shopId);

            if (order) {
                ordersWithDetails.push(order);
            }
        }

        return ordersWithDetails;
    }
}

module.exports = new GetManyOrdersUseCase(new OrderRepository());
