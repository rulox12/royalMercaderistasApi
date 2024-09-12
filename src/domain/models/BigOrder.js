class BigOrder {
  constructor(id, date, cityId, platformId) {
    this.id = id
    this.date = date
    this.cityId = cityId
    this.status = 'Pending'
    this.platformId = platformId && platformId.trim() !== '' ? platformId : null;
  }
}

module.exports = BigOrder;
