const mongoose = require('mongoose');
const { Schema } = mongoose;

const listScheme = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
});

const ListModel = mongoose.model('List', listScheme);

module.exports = ListModel;
