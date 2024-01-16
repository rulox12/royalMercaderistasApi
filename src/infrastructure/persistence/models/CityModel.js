const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
});

const CityModel = mongoose.model("City", citySchema);

module.exports = CityModel;