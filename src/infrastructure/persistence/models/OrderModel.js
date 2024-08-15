const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  platform: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Platform",
    required: true,
  },
  orderDetails: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    INVE: String,
    AVER: String,
    LOTE: String,
    RECI: String,
    PEDI: String,
    VENT: String,
    PEDI_REAL: String,
  }],
});

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;
