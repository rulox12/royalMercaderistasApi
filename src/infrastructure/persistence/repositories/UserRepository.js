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

  async findByEmail(email) {
    return UserModel.findOne({ email }).exec();
  }

  async getAllUsers() {
    try {
      const users = await UserModel.find().populate('roleId');
      return users;
    } catch (error) {
      throw new Error(`Error while fetching users: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const user = await UserModel.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw new Error(`Error while delete user: ${error.message}`);
    }
  }


  async update(userId, updatedFields) {
    try {
      const updateUser = await UserModel.findByIdAndUpdate(
        userId,
        updatedFields,
        { new: true }
      );

      return updateUser;
    } catch (error) {
      throw new Error(`Error while updating user: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
