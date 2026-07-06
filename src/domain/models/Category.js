class Category {
  constructor(id, name, groupForSale = true) {
    this.id = id;
    this.name = name;
    this.groupForSale = groupForSale;
  }
}

module.exports = Category;
