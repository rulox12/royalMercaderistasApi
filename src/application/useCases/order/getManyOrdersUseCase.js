const OrderDetailsRepository = require('../../../infrastructure/persistence/repositories/OrderDetailsRepository');
const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetManyOrdersUseCase {
    constructor(orderDetailsRepository, orderRepository) {
        this.orderDetailsRepository = orderDetailsRepository;
        this.orderRepository = orderRepository;
    }

    async execute(dates, shopId) {
        const orderDetails = [];
        for (const date of dates) {
            const order = await this.orderRepository.getOrderByDateAndShop(date, shopId);

            if (order) {
                const detailOrder = await this.orderDetailsRepository.findByOrderId(order._id)
                if (detailOrder) {
                    const plainOrder = order.toObject();
                    const plainDetailOrder = detailOrder.map(detail => detail.toObject());
                    orderDetails.push({ order: plainOrder, detailOrder: plainDetailOrder });
                } else {
                    orderDetails.push({ order });
                }
            }
        }
        return orderDetails;
    }
}

module.exports = new GetManyOrdersUseCase(new OrderDetailsRepository(), new OrderRepository());
