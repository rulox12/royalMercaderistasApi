const moment = require("moment");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");
const CityRepository = require("../../../infrastructure/persistence/repositories/CityRepository");
const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");

class GetNotReceivedOrdersByShopAndRangeUseCase {
    constructor(orderRepository, shopRepository, cityRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.shopRepository = shopRepository;
        this.cityRepository = cityRepository;
        this.userRepository = userRepository;
    }

    async execute(shopId, startDate, endDate) {
        const shop = await this.shopRepository.findById(shopId);
        console.log("Shop found:", shop);
        if (!shop) {
            throw new Error(`La tienda con ID ${shopId} no existe`);
        }

        const start = moment(startDate);
        const end = moment(endDate);
        const missingDays = [];

        for (let date = moment(start); date.isSameOrBefore(end); date.add(1, 'days')) {
            const orders = await this.orderRepository.getOrderByDateAndShop( date.format('YYYY-MM-DD'), shopId);
            const city = await this.cityRepository.findById(shop.cityId);
            const user = await this.userRepository.findById(shop.userId);
            console.log(`Orders for date ${date.format("YYYY-MM-DD")} and shop ${shop}:`, orders);
            if (!orders || orders.length === 0) {
                missingDays.push({
                    date: date.format("YYYY-MM-DD"),
                    shop: {
                        _id: shop._id,
                        name: shop.name,
                        city: city ? city.name : "Ciudad no encontrada",
                        user: user ? user.name : "Usuario no encontrado",
                    },
                });
            }
        }

        return missingDays;
    }
}

module.exports = new GetNotReceivedOrdersByShopAndRangeUseCase(
    new OrderRepository(),
    new ShopRepository(),
    new CityRepository(),
    new UserRepository()
);