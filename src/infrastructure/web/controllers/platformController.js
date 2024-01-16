const CreatePlatformUseCase = require("../../../application/useCases/platform/createPlatform");
const GetPlatformUseCase = require("../../../application/useCases/platform/getPlatform");
const GetPlatformsUseCase = require("../../../application/useCases/platform/getPlatforms");

const platformController = {
  createPlatform: async (req, res) => {
    try {
      const { name, nit } = req.body;
      const createPlatform = await CreatePlatformUseCase.execute(name, nit);

      res.status(201).json(createPlatform);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPlatform: async (req, res) => {
    try {
      const platformId = req.params.platformId;
      const platform = await GetPlatformUseCase.execute(platformId);

      if (!platform) {
        return res.status(404).json({ message: "Plataforma no encontrado" });
      }
      res.status(200).json(platform);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updatePlatform: async (req, res) => {
    try {
      const userId = req.params.userId;
      const { username, email } = req.body;

      const updatedUser = await UpdateUserUseCase.execute(
        userId,
        username,
        email
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "Plataforma no encontrado" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getPlatforms: async (req, res) => {
    try {
      const users = await GetPlatformsUseCase.execute();

      if (!users) {
        return res.status(404).json({ message: "Plataformas no encontrados" });
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = platformController;
