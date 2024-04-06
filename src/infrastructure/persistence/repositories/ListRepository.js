const ListModel = require("../models/ListModel");
const ListProductModel = require("../models/ListProductModel");

class ListRepository {
  async create(list) {
    const newList = new ListModel(list);
    await newList.save();

    return newList.toObject();
  }

  async findById(listId) {
    return ListModel.findById(listId).exec();
  }

  async getAll() {
    try {
      const lists = await ListModel.find();
      return lists;
    } catch (error) {
      throw new Error(`Error while fetching lists: ${error.message}`);
    }
  }

  async createListProduct(products) {
    const savedProducts = await ListProductModel.create(products);
    if (savedProducts) {
      return savedProducts;
    }
  }

  async getListProduct(listId, populateProduct) {
    let products;
    if (populateProduct) {
      products = await ListProductModel.find({ listId })
        .populate("productId")
        .exec();
    } else {
      products = await ListProductModel.find({ listId }).exec();
    }
    return products;
  }

  async updateListProduct(listId, productId, updatedFields) {
    try {
      const updatedProduct = await ListProductModel.findOneAndUpdate(
        { listId, productId },
        { $set: updatedFields },
        { new: true }
      );

      return updatedProduct;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  async deleteListProduct(listId, productId) {
    try {
      const deletedProduct = await ListProductModel.findOneAndDelete({
        listId,
        productId,
      });

      return deletedProduct;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  async deleteDetailsByProduct(productId) {
    try {
      const details = await ListProductModel.deleteMany({
        productId,
      });

      return details;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }
}

module.exports = ListRepository;
