const Product = require("../../../domain/models/Product");
const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class CreateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(internalProductNumber, name, presentation, supplier, displayName, position) {
    const product = new Product(internalProductNumber, name, presentation, supplier, displayName, position);

    const queryName = { name }
    const existProductName = await this.productRepository.findProduct(queryName);
    if (existProductName) {
      throw new Error("Ya existe un producto con este nombre");
    }

    const queryPosition = { position }
    const existProductPosition = await this.productRepository.findProduct(queryPosition);
    if (existProductPosition) {
      throw new Error("Ya existe un producto con la posición indicada");
    }

    return await this.productRepository.create(product);
  }
}

module.exports = new CreateProductUseCase(new ProductRepository());