const City = require("../models/CityModel");

class CityRepository {
  async create(city) {
    console.log(city);
    const newCity = new City(city);
    await newCity.save();

    return newCity.toObject();
  }

  async findById(cityId) {
    return City.findById(cityId).exec();
  }

  async getAll() {
    try {
      const cities = await City.find();

      return cities;
    } catch (error) {
      throw new Error(`Error while fetching lists: ${error.message}`);
    }
  }
}

module.exports = CityRepository;