class BigOrder {
  constructor(id, date, cityId, platformId) {
    this.id = id
    this.date = date
    this.cityId = cityId
    this.status = 'Pending'
    this.platform = platformId;
  }
}

module.exports = BigOrder;
