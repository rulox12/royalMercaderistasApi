const mongoose = require("mongoose");

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nit: {
    type: String,
    required: true,
  },
});


const PlatformModel = mongoose.model("Platform", platformSchema);

module.exports = PlatformModel;
