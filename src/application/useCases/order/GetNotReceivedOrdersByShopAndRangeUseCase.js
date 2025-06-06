const moment = require("moment");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class GetNotReceivedOrdersByShopAndRangeUseCase {
    constructor(orderRepository, shopRepository) {
        this.orderRepository = orderRepository;
        this.shopRepository = shopRepository;
    }

    async execute(shopId, startDate, endDate) {
        const shop = await this.shopRepository.findById(shopId);
        if (!shop) {
            throw new Error(`La tienda con ID ${shopId} no existe`);
        }

        const start = moment(startDate);
        const end = moment(endDate);
        const missingDays = [];

        for (let date = moment(start); date.isSameOrBefore(end); date.add(1, 'days')) {
            const orders = await this.orderRepository.getOrderByDateAndShop( date.format('YYYY-MM-DD'), shopId);
            if (!orders || orders.length === 0) {
                missingDays.push({
                    date: date.format('YYYY-MM-DD'),
                    shop: {
                        _id: shop._id,
                        name: shop.name
                    }
                });
            }
        }

        return missingDays;
    }
}

module.exports = new GetNotReceivedOrdersByShopAndRangeUseCase(
    new OrderRepository(),
    new ShopRepository()
);