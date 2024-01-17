const CityRepository = require("../../../infrastructure/persistence/repositories/CityRepository");

class GetCityUseCase {
  constructor(cityRepository) {
    this.cityRepository = cityRepository;
  }

  async execute(cityId) {
    return this.cityRepository.findById(cityId);
  }
}

module.exports = new GetCityUseCase(new CityRepository());
