const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

class GetNotReceivedOrdersUseCase {
    constructor(orderRepository,shopRepository) {
        this.orderRepository = orderRepository;
        this.shopRepository = shopRepository;
    }

    async execute(date) {
        const allShops = await this.shopRepository.getAll({},['userId', 'cityId', 'listId', 'platformId']);

        const receivedShopIds = await this.orderRepository.getReceivedShopsByDate(date);
        console.log(receivedShopIds)

        const notReceivedShops = allShops.filter(shop => !receivedShopIds.includes(shop._id.toString()));

        return notReceivedShops;
    }
}

module.exports = new GetNotReceivedOrdersUseCase(new OrderRepository(), new ShopRepository());