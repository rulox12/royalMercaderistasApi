const BigOrderRepository = require('../../../infrastructure/persistence/repositories/BigOrderRepository');
const OrderDetailsRepository = require('../../../infrastructure/persistence/repositories/OrderDetailsRepository');
const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class GetBigOrderByDateandCity {
    constructor(bigOrderDetailsRepository, orderDetailsRepository, orderRepository) {
        this.bigOrderDetailsRepository = bigOrderDetailsRepository;
        this.orderDetailsRepository = orderDetailsRepository;
        this.orderRepository = orderRepository;
    }

    async execute(date, cityId) {
        const bigOrder = await this.bigOrderDetailsRepository.find(date, cityId);
        if (!bigOrder) {
            throw new Error("No existe un pedido para la fecha y ciudad especifica");
        }

        const orders = await this.orderRepository.getAll({date, cityId});


        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const details = await this.orderDetailsRepository.findByOrderId(order._id);
                return { order, details };
            })
        );
        return ordersWithDetails;
    }
}

module.exports = new GetBigOrderByDateandCity(
    new BigOrderRepository(),
    new OrderDetailsRepository(),
    new OrderRepository()
);
