const RoleModel = require("../models/RoleModel");

class RoleRepository {
  async create(role) {
    const newRole = new RoleModel(role);
    await newRole.save();

    return newRole.toObject();
  }

  async findById(roleId) {
    return RoleModel.findById(roleId).exec();
  }

  async getAllRoles() {
    try {
      const roles = await RoleModel.find();
      return roles;
    } catch (error) {
      throw new Error(`Error while fetching roles: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const role = await RoleModel.findByIdAndDelete(id);
      return role;
    } catch (error) {
      throw new Error(`Error while fetching roles: ${error.message}`);
    }
  }
}

module.exports = RoleRepository;