class Order {
    constructor(id, date, shop, status, user, cityId, platformId, orderDetails) {
        this.id = id;
        this.date = date;
        this.shop = shop;
        this.status = status;
        this.user = user;
        this.cityId = cityId;
        this.platform = platformId;
        this.orderDetails = orderDetails || [];
    }
}

module.exports = Order;
