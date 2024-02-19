class BigOrder {
  constructor(id, date, cityId) {
    this.id = id
    this.date = date
    this.cityId = cityId
    this.status = 'Pending'
  }
}

module.exports = BigOrder;
