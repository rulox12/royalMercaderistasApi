const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class AddProductToCategoryUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(productId, categoryId) {
    return this.productRepository.update(productId, { categoryId });
  }
}

module.exports = new AddProductToCategoryUseCase(new ProductRepository());
