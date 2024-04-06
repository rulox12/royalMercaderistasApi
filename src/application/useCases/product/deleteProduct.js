const ListRepository = require('../../../infrastructure/persistence/repositories/ListRepository');
const ProductRepository = require('../../../infrastructure/persistence/repositories/ProductRepository');

class DeleteProductUseCase {
  constructor(productRepository, listRepository) {
    this.productRepository = productRepository;
    this.listRepository = listRepository;
  }

  async execute(id) {
    try {
      const deleteProduct = await this.productRepository.delete(id);
      this.listRepository.deleteDetailsByProduct(id)
      return deleteProduct;
    } catch (e) {
      console.log('capturoelerror', e)
    }
  }
}

module.exports = new DeleteProductUseCase(new ProductRepository(), new ListRepository());