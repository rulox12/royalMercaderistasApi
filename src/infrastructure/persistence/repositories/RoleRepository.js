const RoleModel = require("../models/RoleModel");
const { resolveRolePermissions } = require("../../../domain/permissions");

class RoleRepository {
  normalizeRole(role) {
    if (!role) {
      return role;
    }

    const normalizedRole = typeof role.toObject === 'function' ? role.toObject() : role;
    return {
      ...normalizedRole,
      permissions: resolveRolePermissions(normalizedRole),
    };
  }

  async create(role) {
    const newRole = new RoleModel(role);
    await newRole.save();

    return this.normalizeRole(newRole);
  }

  async findById(roleId) {
    const role = await RoleModel.findById(roleId).exec();
    return this.normalizeRole(role);
  }

  async update(roleId, updatedFields) {
    try {
      const role = await RoleModel.findByIdAndUpdate(
        roleId,
        updatedFields,
        { new: true }
      );

      return this.normalizeRole(role);
    } catch (error) {
      throw new Error(`Error while updating role: ${error.message}`);
    }
  }

  async getAllRoles() {
    try {
      const roles = await RoleModel.find();
      return roles.map((role) => this.normalizeRole(role));
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