const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class UpdateOrdersStatusUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(orderIds, newStatus) {
            { _id: { $in: orderIds } },
            { status: newStatus }
        );
    }
}

module.exports = new UpdateOrdersStatusUseCase(new OrderRepository());