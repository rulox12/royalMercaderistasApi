const Supplier = require('../../../domain/models/supplier');
const SupplierRepository = require('../../../infrastructure/persistence/repositories/SupplierRepository');

class CreateSupplierUseCase {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  async execute(name) {
    const supplier = new Supplier(null, name);
    const createdSupplier = await this.supplierRepository.create(supplier);
    return createdSupplier;
  }
}

module.exports = new CreateSupplierUseCase(new SupplierRepository());