const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema({
  shopNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  manager: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  boss: {
    type: String,
  },
  bossPhone: {
    type: String,
  },
  platformId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Platform",
    required: true,
  },
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
});

const ShopModel = mongoose.model("Shop", shopSchema);

module.exports = ShopModel;
