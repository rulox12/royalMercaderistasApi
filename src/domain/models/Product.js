class Product {
  constructor(internalProductNumber, name, presentation, displayName, position, supplierId) {
    this.internalProductNumber = internalProductNumber;
    this.name = name;
    this.presentation = presentation;
    this.displayName = displayName;
    this.position = position;
    this.supplierId = supplierId;
  }
}

module.exports = Product;
