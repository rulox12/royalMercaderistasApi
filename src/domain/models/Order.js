class Order {
  constructor(id, date, shopId, status, user, cityId) {
    this.id = id
    this.date = date
    this.shop = shopId
    this.status = status
    this.user = user
    this.cityId = cityId
  }
}

module.exports = Order;
