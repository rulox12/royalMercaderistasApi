class Product {
  constructor(internalProductNumber, name, presentation, supplier, displayName, position) {
    this.internalProductNumber = internalProductNumber;
    this.name = name;
    this.presentation = presentation;
    this.supplier = supplier;
    this.displayName = displayName;
    this.position = position;
  }
}

module.exports = Product;
