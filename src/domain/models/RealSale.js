class RealSale {
    constructor(
        id,
        platformId,
        cityId,
        shopId,
        startDate,
        endDate,
        categories,
    ) {
        this.id = id;
        this.platformId = platformId;
        this.cityId = cityId;
        this.shopId = shopId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.categories = categories || [];
    }
}

module.exports = RealSale;