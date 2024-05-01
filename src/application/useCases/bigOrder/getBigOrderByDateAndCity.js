const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetBigOrderByDateandCity {
    constructor(bigOrderRepository, orderRepository) {
        this.bigOrderRepository = bigOrderRepository;
        this.orderRepository = orderRepository;
    }

    async execute(date, cityId) {
        const bigOrder = await this.bigOrderRepository.find(date, cityId);

        if (!bigOrder) {
            throw new Error("No existe un pedido para la fecha y ciudad especifica");
        }

        const orders = await this.orderRepository.getAll({ date, cityId });

        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const details = order.orderDetails;
                return { order, details };
            })
        );

        return ordersWithDetails;
    }
}

module.exports = new GetBigOrderByDateandCity(new BigOrderRepository(), new OrderRepository);
