const ListRepository = require("../../../infrastructure/persistence/repositories/ListRepository");

class CreateListProductUseCase {
  constructor(listRepository) {
    this.listRepository = listRepository
  }

  async execute(listId, productsWithFields) {
    const existingProducts = await this.listRepository.getListProduct(listId);

    const productsToUpdate = productsWithFields.filter(product => {
      return existingProducts.some(existingProduct => {
        return existingProduct.productId.toString() === product.productId
      });
    });

    for (const productToUpdate of productsToUpdate) {
      await this.listRepository.updateListProduct(
        listId,
        productToUpdate.productId,
        {
          cost: productToUpdate.cost,
          salePrice: productToUpdate.salePrice,
          pvp: productToUpdate.pvp,
        }
      );
    }
    
    const productsToDelete = existingProducts.filter(existingProduct =>
      !productsWithFields.some(product =>
        existingProduct.productId.toString() === product.productId
      )
    );

    for (const productToDelete of productsToDelete) {
      await this.listRepository.deleteListProduct(
        listId,
        productToDelete.productId
      );
    }

    const productsToAdd = productsWithFields.filter(product => {
      return !existingProducts.some(existingProduct =>
        existingProduct.productId.toString() === product.productId
      );
    });

    const newProducts = productsToAdd.map(product => ({
      listId,
      productId: product.productId,
      cost: product.cost,
      salePrice: product.salePrice,
      pvp: product.pvp,
    }));

    const response = await this.listRepository.createListProduct(newProducts);

    const listProducts = await this.listRepository.getListProduct(listId);

    return listProducts;
  }
}

module.exports = new CreateListProductUseCase(new ListRepository());
