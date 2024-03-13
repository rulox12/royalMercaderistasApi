const CreateRoleUseCase = require('../../../application/useCases/role/createRole');
const GetRoleUseCase = require('../../../application/useCases/role/getRole');
const GetRolesUseCase = require('../../../application/useCases/role/getRoles');
const DeleteRoleUseCase = require('../../../application/useCases/role/deleteRole');

const roleController = {
  createRole: async (req, res) => {
    try {
      const { name, description } = req.body;

      const createdRole = await CreateRoleUseCase.execute(name, description);

      res.status(201).json(createdRole);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getRole: async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const role = await GetRoleUseCase.execute(roleId);

      if (!role) {
        return res.status(404).json({ message: "Rol no encontrado" });
      }

      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getRoles: async (req, res) => {
    try {
      const role = await GetRolesUseCase.execute();

      if (!role) {
        return res.status(404).json({ message: "No se encontraron roles" });
      }

      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteRole: async (req, res) => {
    try {
      const role = await DeleteRoleUseCase.execute(req.body.roleId);

      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = roleController;
