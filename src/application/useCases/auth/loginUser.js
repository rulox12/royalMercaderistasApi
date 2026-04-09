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
      const sessionVersion = process.env.AUTH_SESSION_VERSION || "1";
      const jwtSecret = process.env.JWT_SECRET || "secreto_del_token";
      const token = jwt.sign(
        { userId: user.id, email: user.email, sessionVersion },
        jwtSecret,
        { expiresIn: '1h' }
      );

      const safeUser = user.toObject();
      delete safeUser.password;

      return { user: safeUser, token };
    } else {
      throw new Error("Contraseña incorrecta");
    }
  }
}

module.exports = new LoginUserUseCase(new UserRepository());
