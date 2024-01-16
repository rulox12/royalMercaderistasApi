const UserModel = require("../models/UserModel");

class UserRepository {
  async create(user) {
    const newUser = new UserModel(user);
    await newUser.save();
    return newUser.toObject();
  }

  async findById(userId) {
    return UserModel.findById(userId).exec();
  }

  async update(userId, username, email) {
    return UserModel.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    ).exec();
  }

  async findByEmail(email) {
    return UserModel.findOne({ email }).exec();
  }

  async getAllUsers() {
    try {
      const users = await UserModel.find();
      return users;
    } catch (error) {
      throw new Error(`Error while fetching users: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
