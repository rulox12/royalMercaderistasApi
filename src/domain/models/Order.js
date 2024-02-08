class Order {
  constructor(id, date, shopId, status, user) {
    this.id = id
    this.date = date
    this.shop = shopId
    this.status = status
    this.user = user
  }
}

module.exports = Order;
