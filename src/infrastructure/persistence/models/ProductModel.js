const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  internalProductNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  presentation: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
