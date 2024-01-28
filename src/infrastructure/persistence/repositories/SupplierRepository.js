const SupplierModel = require("../models/SupplierModel");

class SupplierRepository {
  async create(supplier) {
    const newSupplier = new SupplierModel(supplier);
    await newSupplier.save();

    return newSupplier.toObject();
  }

  async findById(supplierId) {
    return SupplierModel.findById(supplierId).exec();
  }

  async getAll() {
    try {
      const roles = await SupplierModel.find();
      return roles;
    } catch (error) {
      throw new Error(`Error while fetching supplier: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const supplier = await SupplierModel.findByIdAndDelete(id);
      return supplier;
    } catch (error) {
      throw new Error(`Error while fetching supliers: ${error.message}`);
    }
  }

  async update(supplierId, updatedFields) {
    try {
      const updateSupplier = await SupplierModel.findByIdAndUpdate(
        supplierId,
        updatedFields,
        { new: true }
      );

      return updateSupplier;
    } catch (error) {
      throw new Error(`Error while updating supplier: ${error.message}`);
    }
  }
}

module.exports = SupplierRepository;