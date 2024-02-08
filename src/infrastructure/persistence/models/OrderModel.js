const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderScheme = new Schema({
  date: {
    type: String,
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
  status: {
    type: String,
    required: true,
  },
});

const OrderModel = mongoose.model('Order', OrderScheme);

module.exports = OrderModel;
