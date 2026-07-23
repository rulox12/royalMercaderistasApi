class BigOrder {
  constructor(id, date, cityId, platformId, createdBy = null, updatedBy = null) {
    this.id = id
    this.date = date
    this.cityId = cityId
    this.status = 'Pending'
    this.platformId = platformId && platformId.trim() !== '' ? platformId : null;
    this.createdBy = createdBy;
    this.updatedBy = updatedBy;
  }
}

module.exports = BigOrder;
