const CityRepository = require('../../../infrastructure/persistence/repositories/CityRepository');

class DeleteCityUseCase {
  constructor(cityRepository) {
    this.cityRepository = cityRepository;
  }

  async execute(id) {
    const deleteCity = await this.cityRepository.delete(id);

    return deleteCity;
  }
}

module.exports = new DeleteCityUseCase(new CityRepository());