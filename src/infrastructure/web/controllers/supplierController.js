const CreateSupplierUseCase = require('../../../application/useCases/supplier/createSupplier');
const GetSupplierUseCase = require('../../../application/useCases/supplier/getSupplier');
const GetSuppliersUseCase = require('../../../application/useCases/supplier/getSuppliers');
const DeleteSupplierUseCase = require('../../../application/useCases/supplier/deleteSupplier');
const UpdateSupplierUseCase = require('../../../application/useCases/supplier/updateSupplier');

const supplierController = {
  createSupplier: async (req, res) => {
    try {
      const { name } = req.body;
      const createdSupplier = await CreateSupplierUseCase.execute(name);

      res.status(201).json(createdSupplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSupplier: async (req, res) => {
    try {
      const { supplierId } = req.params;
      const supplier = await GetSupplierUseCase.execute(supplierId);

      if (!supplier) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }

      res.status(200).json(supplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSuppliers: async (req, res) => {
    try {
      const supplier = await GetSuppliersUseCase.execute();

      if (!supplier) {
        return res.status(404).json({ message: "No se encontraron proveedor" });
      }

      res.status(200).json(supplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteSupplier: async (req, res) => {
    try {
      const supplier = await DeleteSupplierUseCase.execute(req.body.supplierId);

      res.status(200).json(supplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSupplier: async (req, res) => {
    try {
      const { supplierId } = req.params;
      const updateFields = req.body;

      const updatedSupplier = await UpdateSupplierUseCase.execute(supplierId, updateFields);

      if (!updatedSupplier) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }

      res.status(200).json(updatedSupplier);
    } catch (error) {
      res.status(500).json({ error: 'Ocurrio un error' });
    }
  },

};

module.exports = supplierController;
