const ProductRepository = require('../../../infrastructure/persistence/repositories/ProductRepository');

class DeleteProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    const deleteProduct = await this.productRepository.delete(id);
    
    return deleteProduct;
  }
}

module.exports = new DeleteProductUseCase(new ProductRepository());