const LoginUserUseCase = require("../../../application/useCases/auth/loginUser");

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
};

module.exports = authController;
