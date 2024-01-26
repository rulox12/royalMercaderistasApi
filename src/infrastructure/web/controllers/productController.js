const CreateProductUseCase = require("../../../application/useCases/product/createProduct");
const GetProductUseCase = require("../../../application/useCases/product/getProduct");
const GetProductsUseCase = require("../../../application/useCases/product/getProducts");
const UpdateProductUseCase = require("../../../application/useCases/product/updateProduct");
const DeleteProductUseCase = require("../../../application/useCases/product/deleteProduct");

const productController = {
  createProduct: async (req, res) => {
    try {
      const { internalProductNumber, name, presentation, quantity, supplier, displayName, position } = req.body;
      const createProduct = await CreateProductUseCase.execute(internalProductNumber, name, presentation, quantity, supplier, displayName, position);

      res.status(201).json(createProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProduct: async (req, res) => {
    try {
      const productId = req.params.productId;
      const product = await GetProductUseCase.execute(productId);

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const productId = req.params.productId;
      const { name, quantity, supplier, displayName, position } = req.body;

      const updatedProduct = await UpdateProductUseCase.execute(
        productId,
        name,
        quantity,
        supplier,
        displayName,
        position
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await GetProductsUseCase.execute();

      if (!products) {
        return res.status(404).json({ message: "Productos no encontrados" });
      }

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  deleteProduct: async (req, res) => {
    try {
      const productDelete = await DeleteProductUseCase.execute(req.body.productId);

      res.status(200).json(productDelete);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = productController;
