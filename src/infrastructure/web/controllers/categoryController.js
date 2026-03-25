const CreateCategoryUseCase = require('../../../application/useCases/category/createCategory');
const GetCategoriesUseCase = require('../../../application/useCases/category/getCategories');
const DeleteCategoryUseCase = require('../../../application/useCases/category/deleteCategory');
const UpdateCategoryUseCase = require('../../../application/useCases/category/updateCategory');
const AddProductToCategoryUseCase = require('../../../application/useCases/category/addProductToCategory');
const RemoveProductFromCategoryUseCase = require('../../../application/useCases/category/removeProductFromCategory');

const categoryController = {
  createCategory: async (req, res) => {
    try {
      const { name } = req.body;
      const created = await CreateCategoryUseCase.execute(name);
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await GetCategoriesUseCase.execute();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { categoryId } = req.body;
      const deleted = await DeleteCategoryUseCase.execute(categoryId);
      if (!deleted) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      res.status(200).json(deleted);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const updated = await UpdateCategoryUseCase.execute(categoryId, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Categoría no encontrada" });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addProductToCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { productId } = req.body;
      const updated = await AddProductToCategoryUseCase.execute(productId, categoryId);
      if (!updated) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  removeProductFromCategory: async (req, res) => {
    try {
      const { productId } = req.params;
      const updated = await RemoveProductFromCategoryUseCase.execute(productId);
      if (!updated) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = categoryController;
