class Order {
    constructor(id, date, shop, status, user, cityId, platformId, orderDetails, details, createdBy = null, updatedBy = null) {
        this.id = id;
        this.date = date;
        this.shop = shop;
        this.status = status;
        this.user = user;
        this.cityId = cityId;
        this.platform = platformId;
        this.orderDetails = orderDetails || [];
        this.details = details || '';
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
}

module.exports = Order;
