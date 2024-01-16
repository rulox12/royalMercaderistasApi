const CityRepository = require("../../../infrastructure/persistence/repositories/CityRepository");

class GetCitiesUseCase {
  constructor(cityRepository) {
    this.cityRepository = cityRepository;
  }

  async execute() {
    return this.cityRepository.getAll();
  }
}

module.exports = new GetCitiesUseCase(new CityRepository());
