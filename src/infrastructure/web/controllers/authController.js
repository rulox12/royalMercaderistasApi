const LoginUserUseCase = require("../../../application/useCases/auth/loginUser");
const UserRepository = require("../../persistence/repositories/UserRepository");
const jwt = require("jsonwebtoken");

const userRepository = new UserRepository();

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const response = await LoginUserUseCase.execute(email, password);

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  me: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

      if (!token) {
        return res.status(401).json({ error: "Token requerido" });
      }

      const jwtSecret = process.env.JWT_SECRET || "secreto_del_token";
      const expectedSessionVersion = process.env.AUTH_SESSION_VERSION || "1";
      const payload = jwt.verify(token, jwtSecret);

      if (payload.sessionVersion !== expectedSessionVersion) {
        return res.status(401).json({ error: "Sesión expirada. Inicia sesión de nuevo" });
      }

      const user = await userRepository.findById(payload.userId);
      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      const safeUser = user.toObject();
      delete safeUser.password;

      return res.status(200).json({ user: safeUser });
    } catch (error) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  },
};

module.exports = authController;
