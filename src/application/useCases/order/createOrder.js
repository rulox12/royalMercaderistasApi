const Order = require("../../../domain/models/Order");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class CreateOrderUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository
    }

    async execute(shopId, date, userId, cityId, platformId, details) {
        const newOrder = new Order(null, formatDateForDatabase(date), shopId, "Pending", userId, cityId, platformId, [], details);
        const existOrder = await this.orderRepository.getOrderByDateAndShop(date, shopId);

        if (existOrder) {
            if (existOrder.details !== details) {
                existOrder.details = details;
                return await this.orderRepository.update(existOrder._id, {details});
            }
            return existOrder;
        } else {
            return await this.orderRepository.create(newOrder);
        }
    }
}

function formatDateForDatabase(isoDateString) {
    const date = new Date(isoDateString);
    return date.toISOString();
}

module.exports = new CreateOrderUseCase(new OrderRepository());
