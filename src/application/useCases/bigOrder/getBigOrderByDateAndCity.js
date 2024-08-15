const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class GetBigOrderByDateAndCity {
    constructor(bigOrderRepository, orderRepository) {
        this.bigOrderRepository = bigOrderRepository;
        this.orderRepository = orderRepository;
    }

    async execute(date, cityId, platformId) {
        const query = { date, cityId, ...(platformId && { platformId }) };
        console.log(query);
        const bigOrder = await this.bigOrderRepository.find(query);
        if (!bigOrder) {
            throw new Error("No existe un pedido para la fecha y ciudad especifica");
        }

        const orders = await this.orderRepository.getAll(query);

        return await Promise.all(
            orders.orders.map(async (order) => {
                const details = order.orderDetails;
                return {order, details};
            })
        );
    }
}

module.exports = new GetBigOrderByDateAndCity(new BigOrderRepository(), new OrderRepository());
