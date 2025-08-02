class Order {
    constructor(id, date, shop, status, user, cityId, platformId, orderDetails, details) {
        this.id = id;
        this.date = date;
        this.shop = shop;
        this.status = status;
        this.user = user;
        this.cityId = cityId;
        this.platform = platformId;
        this.orderDetails = orderDetails || [];
        this.details = details || '';
    }
}

module.exports = Order;
