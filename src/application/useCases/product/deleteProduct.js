const ListRepository = require('../../../infrastructure/persistence/repositories/ListRepository');
const ProductRepository = require('../../../infrastructure/persistence/repositories/ProductRepository');

class DeleteProductUseCase {
  constructor(productRepository, listRepository) {
    this.productRepository = productRepository;
    this.ListRepository = listRepository;
  }

  async execute(id) {
    const deleteProduct = await this.productRepository.delete(id);
    const removeDetails = await this.listRepository.deleteDetailsByProduct(id)
    console.log(removeDetails)  
    return deleteProduct;
  }
}

module.exports = new DeleteProductUseCase(new ProductRepository(), new ListRepository());