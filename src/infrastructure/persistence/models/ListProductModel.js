const mongoose = require('mongoose');

const listProductSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  cost: String,
  salePrice: String,
  pvp: String,
});

const ListProduct = mongoose.model('ListProduct', listProductSchema);

module.exports = ListProduct;
