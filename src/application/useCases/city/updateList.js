const CityRepository = require("../../../infrastructure/persistence/repositories/CityRepository");

class UpdateCityUseCase {
  constructor(cityRepository) {
    this.cityRepository = cityRepository;
  }

  async execute(cityId, name, department) {
    return this.cityRepository.update(cityId, name, department);
  }
}

module.exports = new UpdateCityUseCase(new CityRepository());
