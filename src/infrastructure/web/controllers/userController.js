const CreateUserUseCase = require("../../../application/useCases/user/createUser");
const GetUserUseCase = require("../../../application/useCases/user/getUser");
const GetUsersUseCase = require("../../../application/useCases/user/getUsers");
const DeleteUserUseCase = require('../../../application/useCases/user/deleteUser');

const userController = {
  createUser: async (req, res) => {
    try {
      const { documentType, document, name, surname, email, phone, password, roleId } = req.body;

      const createdUser = await CreateUserUseCase.execute(
        documentType,
        document,
        name,
        surname,
        email,
        phone,
        password,
        roleId
      );

      res.status(201).json(createdUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await GetUserUseCase.execute(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      const { username, email } = req.body;

      const updatedUser = await UpdateUserUseCase.execute(
        userId,
        username,
        email
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const users = await GetUsersUseCase.execute();

      if (!users) {
        return res.status(404).json({ message: "Ususarios no encontrados" });
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const userDelete = await DeleteUserUseCase.execute(req.body.userId);

      res.status(200).json(userDelete);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
