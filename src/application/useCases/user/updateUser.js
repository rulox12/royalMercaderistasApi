const bcrypt = require("bcryptjs/dist/bcrypt");
const UserRepository = require("../../../infrastructure/persistence/repositories/UserRepository");

class UpdateUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, updateFields) {
    try {
      const existingUser = await this.userRepository.findById(userId);

      if (!existingUser) {
        throw new Error("Usuario no encontrado");
      }

      // Filtrar solo campos con valor definido y no vacío
      const fieldsToUpdate = {};
      Object.keys(updateFields).forEach((key) => {
        const value = updateFields[key];
        // Nunca actualizar contraseña desde aquí - protección máxima
        if (key === 'password') {
          return;
        }
        // Incluir el campo si tiene valor definido, no es null, y no es string vacío
        if (value !== undefined && value !== null && value !== '') {
          fieldsToUpdate[key] = value;
        }
      });

      // Contraseña SOLO se actualiza si viene no vacía Y tiene al menos 8 caracteres
      if (updateFields.password && updateFields.password.trim().length >= 8) {
        fieldsToUpdate.password = await bcrypt.hash(updateFields.password.trim(), 10);
      }

      Object.assign(existingUser, fieldsToUpdate);

      const updatedUser = await this.userRepository.update(userId, existingUser);

      return updatedUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UpdateUserUseCase(new UserRepository());
