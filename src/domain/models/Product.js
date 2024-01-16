class Product {
  constructor(internalProductNumber, name, presentation, quantity, supplier, displayName, position) {
    this.internalProductNumber = internalProductNumber;
    this.name = name;
    this.presentation = presentation;
    this.quantity = quantity;
    this.supplier = supplier;
    this.displayName = displayName;
    this.position = position;
  }
}

module.exports = Product;
