const Product = require("../../../domain/models/Product");
const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class CreateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(internalProductNumber, name, presentation, quantity, supplier, displayName, position) {
    const product = new Product(internalProductNumber, name, presentation, quantity, supplier, displayName, position);

    return await this.productRepository.create(product);
  }
}

module.exports = new CreateProductUseCase(new ProductRepository());