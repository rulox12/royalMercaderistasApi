const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class GetProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(productId) {
    return this.productRepository.findById(productId);
  }
}

module.exports = new GetProductUseCase(new ProductRepository());
