const CategoryModel = require("../models/CategoryModel");
const ProductModel = require("../models/ProductModel");

class CategoryRepository {
  async create(category) {
    const newCategory = new CategoryModel(category);
    await newCategory.save();
    return newCategory.toObject();
  }

  async findById(categoryId) {
    return CategoryModel.findById(categoryId).exec();
  }

  async getAll() {
    try {
      const categories = await CategoryModel.find();
      return categories;
    } catch (error) {
      throw new Error(`Error while fetching categories: ${error.message}`);
    }
  }

  async getAllWithProducts() {
    try {
      const categories = await CategoryModel.find().lean();
      const products = await ProductModel.find({ categoryId: { $ne: null } })
        .populate("supplierId")
        .lean();

      const productsByCategory = {};
      products.forEach((p) => {
        const key = String(p.categoryId);
        if (!productsByCategory[key]) productsByCategory[key] = [];
        productsByCategory[key].push(p);
      });

      return categories.map((cat) => ({
        ...cat,
        products: productsByCategory[String(cat._id)] || [],
      }));
    } catch (error) {
      throw new Error(`Error while fetching categories with products: ${error.message}`);
    }
  }

  async delete(categoryId) {
    try {
      // Desasociar productos de esta categoría antes de eliminar
      await ProductModel.updateMany({ categoryId }, { categoryId: null });
      return CategoryModel.findByIdAndDelete(categoryId);
    } catch (error) {
      throw new Error(`Error while deleting category: ${error.message}`);
    }
  }

  async update(categoryId, updatedFields) {
    try {
      return CategoryModel.findByIdAndUpdate(categoryId, updatedFields, { new: true });
    } catch (error) {
      throw new Error(`Error while updating category: ${error.message}`);
    }
  }
}

module.exports = CategoryRepository;
