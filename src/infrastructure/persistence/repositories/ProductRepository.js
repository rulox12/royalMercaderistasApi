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
      const products = await ProductModel.find().populate('supplierId');
      return products;
    } catch (error) {
      throw new Error(`Error while fetching products: ${error.message}`);
    }
  }

  async findProduct(query){
    return ProductModel.findOne(query).exec();
  }

  async delete(productId) {
    try {
      const productDelete = await ProductModel.findByIdAndDelete(productId);
      
      return productDelete;
    } catch (error) {
      throw new Error(`Error while delete product: ${error.message}`);
    }
  }

  async update(productId, updatedFields) {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        updatedFields,
        { new: true }
      );

      return updatedProduct;
    } catch (error) {
      throw new Error(`Error while updating product: ${error.message}`);
    }
  }
}

module.exports = ProductRepository;
