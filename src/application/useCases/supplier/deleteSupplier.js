const SupplierRepository = require('../../../infrastructure/persistence/repositories/SupplierRepository');

class DeleteSupplierUseCase {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  async execute(id) {
    const deleteSupplier = await this.supplierRepository.delete(id);
    return deleteSupplier;
  }
}

module.exports = new DeleteSupplierUseCase(new SupplierRepository());