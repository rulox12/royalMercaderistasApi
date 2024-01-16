const City = require("../../../domain/models/City");
const CityRepository = require("../../../infrastructure/persistence/repositories/CityRepository");

class CreateCityUseCase {
  constructor(cityRepository) {
    this.cityRepository = cityRepository
  }

  async execute(name, department) {
    const city = new City(null, name, department);
    const createdCity = await this.cityRepository.create(city);

    return createdCity;
  }
}

module.exports = new CreateCityUseCase(new CityRepository());