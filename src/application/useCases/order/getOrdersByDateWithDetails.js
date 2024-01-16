const OrderDetailsRepository = require('../../../infrastructure/persistence/repositories/OrderDetailsRepository');
const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetOrdersByDateWithDetailsUseCase {
    constructor(orderDetailsRepository, orderRepository) {
        this.orderDetailsRepository = orderDetailsRepository;
        this.orderRepository = orderRepository;
    }

    async execute(date) {
        const orders = await this.orderRepository.getOrdersByDate(date);
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const details = await this.orderDetailsRepository.findByOrderId(order._id);
                return { order, details };
            })
        );
        return ordersWithDetails;
    }
}

module.exports = new GetOrdersByDateWithDetailsUseCase(new OrderDetailsRepository(), new OrderRepository());
