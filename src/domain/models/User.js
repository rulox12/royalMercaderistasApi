class User {
  constructor(id,documentType,document, name, surname, email, phone, state, password, roleId) {
    this.id = id;
    this.documentType = documentType;
    this.document = document;
    this.name = name;
    this.surname = surname;
    this.email = email;
    this.phone = phone;
    this.state = state;
    this.password = password
    this.roleId = roleId
  }
}

module.exports = User;
