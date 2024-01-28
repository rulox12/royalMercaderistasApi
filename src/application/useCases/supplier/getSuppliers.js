const SupplierRepository = require("../../../infrastructure/persistence/repositories/SupplierRepository");

class GetSupplierUseCase {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  async execute() {
    return this.supplierRepository.getAll();
  }
}

module.exports = new GetSupplierUseCase(new SupplierRepository());
