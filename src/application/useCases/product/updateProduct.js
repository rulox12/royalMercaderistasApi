const ProductRepository = require("../../../infrastructure/persistence/repositories/ProductRepository");

class GetProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(productId, updateFields) {
    try {
      const existingProduct = await this.productRepository.findById(productId);

      if (!existingProduct) {
        throw new Error("Producto no encontrado");
      }

      Object.assign(existingProduct, updateFields);

      const updatedProduct = await this.productRepository.update(productId, existingProduct);

      return updatedProduct;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new GetProductUseCase(new ProductRepository());
