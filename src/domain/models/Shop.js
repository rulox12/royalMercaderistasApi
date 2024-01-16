class Shop {
  constructor(id, shopNumber, name, address, manager, phone, boss, bossPhone, platformId, cityId, listId, userId) {
    this.id = id;
    this.shopNumber = shopNumber;
    this.name = name;
    this.address = address;
    this.manager = manager;
    this.phone = phone;
    this.boss = boss;
    this.bossPhone = bossPhone;
    this.platformId = platformId;
    this.cityId = cityId;
    this.listId = listId;
    this.userId = userId;
  }
}

module.exports = Shop;
