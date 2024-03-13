const CityRepository = require("../../../infrastructure/persistence/repositories/CityRepository");

class UpdateCityUseCase {
  constructor(cityRepository) {
    this.cityRepository = cityRepository;
  }

  async execute(cityId, updateFields) {
    try {
      const existingCity = await this.cityRepository.findById(cityId);

      if (!existingCity) {
        throw new Error("Ciudad no encontrada");
      }

      Object.assign(existingCity, updateFields);

      const updatedCity = await this.cityRepository.update(cityId, existingCity);

      return updatedCity;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new UpdateCityUseCase(new CityRepository());
