const mongoose = require('mongoose');
const { Schema } = mongoose;

const supplierSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const SupplierModel = mongoose.model('Supplier', supplierSchema);

module.exports = SupplierModel;
