const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class RemoveProductFromCategoryUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(productId) {
    return this.productRepository.update(productId, { categoryId: null });
  }
}

module.exports = new RemoveProductFromCategoryUseCase(new ProductRepository());
