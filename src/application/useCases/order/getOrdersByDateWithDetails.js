const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetOrdersByDateWithDetailsUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(date, cityId, platformId) {
        let orders = {};
        if (platformId) {
            orders = await this.orderRepository.getAll({date, cityId, 'platform':platformId});
        } else {
            orders = await this.orderRepository.getAll({date, cityId});
        }

        return await Promise.all(
            orders.orders.map(async (order) => {
                return {order, details: order.orderDetails};
            })
        );
    }
}

module.exports = new GetOrdersByDateWithDetailsUseCase(new OrderRepository());
