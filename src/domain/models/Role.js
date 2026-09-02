class Role {
  constructor(id, name, description, permissions = []) {
    this.id = id
    this.name = name;
    this.description = description;
    this.permissions = permissions;
  }
}

module.exports = Role;
