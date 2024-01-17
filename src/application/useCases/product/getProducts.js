const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class GetProductsUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute() {
    return this.productRepository.getAll();
  }
}

module.exports = new GetProductsUseCase(new ProductRepository());
