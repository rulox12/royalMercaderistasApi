const SupplierRepository = require("../../../infrastructure/persistence/repositories/SupplierRepository");

class GetSupplierUseCase {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  async execute(supplierId) {
    return this.supplierRepository.findById(supplierId);
  }
}

module.exports = new GetSupplierUseCase(new SupplierRepository());
