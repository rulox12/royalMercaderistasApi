const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    required: true,
  },
  document:{
    type: String,
    required: true,
  },
  phone:{
    type: String,
    required: true,
  },
  state: {
    type: Boolean,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
});


const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
