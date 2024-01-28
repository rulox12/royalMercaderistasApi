const SupplierRepository = require("../../../infrastructure/persistence/repositories/SupplierRepository");

class UpdateSupplierUseCase {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  async execute(supplierId, updateFields) {
    try {
      const existingSupplier = await this.supplierRepository.findById(supplierId);

      if (!existingSupplier) {
        throw new Error("Proveedor no encontrado");
      }

      Object.assign(existingSupplier, updateFields);

      const updatedSupplier = await this.supplierRepository.update(supplierId, existingSupplier);

      return updatedSupplier;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UpdateSupplierUseCase(new SupplierRepository());
