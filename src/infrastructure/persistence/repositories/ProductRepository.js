const ProductModel = require("../models/ProductModel");

class ProductRepository {
  async create(product) {
    const newProduct = new ProductModel(product);
    await newProduct.save();

    return newProduct.toObject();
  }

  async findById(productId) {
    return ProductModel.findById(productId).exec();
  }

  async getAll() {
    try {
      const products = await ProductModel.find();
      return products;
    } catch (error) {
      throw new Error(`Error while fetching products: ${error.message}`);
    }
  }
}

module.exports = ProductRepository;
