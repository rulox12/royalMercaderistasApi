const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ComparePlatformsUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(startDate, endDate) {
        const orders = await this.orderRepository.getOrdersByDateRangeWithPlatform(startDate, endDate);

        const toIntSafe = (val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 0 : num;
        };

        const platformTotals = {};

        for (const order of orders) {
            const platformId = order.platform?._id?.toString() || "unknown";
            if (!platformTotals[platformId]) {
                platformTotals[platformId] = {
                    platform: order.platform?.name || "Sin nombre",
                    ventas: 0,
                    averias: 0,
                    rentabilidad: 0
                };
            }

            for (const detail of order.orderDetails || []) {
                platformTotals[platformId].ventas += toIntSafe(detail.VENT);
                platformTotals[platformId].averias += toIntSafe(detail.AVER);
                platformTotals[platformId].rentabilidad += (toIntSafe(detail.salePrice) - toIntSafe(detail.cost));
            }
        }

        return Object.values(platformTotals);
    }
}

module.exports = new ComparePlatformsUseCase(new OrderRepository());