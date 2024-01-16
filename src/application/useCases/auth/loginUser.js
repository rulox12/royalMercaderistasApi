const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class LoginUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        'secreto_del_token',
        { expiresIn: '1h' }
      );

      return { user, token };
    } else {
      throw new Error("Contraseña incorrecta");
    }
  }
}

module.exports = new LoginUserUseCase(new UserRepository());
