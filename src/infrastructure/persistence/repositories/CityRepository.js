const CityModel = require("../models/CityModel");
const City = require("../models/CityModel");

class CityRepository {
  async create(city) {
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

  async delete(cityId) {
    try {
      const cityDelete = await City.findByIdAndDelete(cityId);

      return cityDelete;
    } catch (error) {
      throw new Error(`Error while delete city: ${error.message}`);
    }
  }
  
  async update(cityId, updatedFields) {
    try {
      const updatedCity = await CityModel.findByIdAndUpdate(
        cityId,
        updatedFields,
        { new: true }
      );

      return updatedCity;
    } catch (error) {
      throw new Error(`Error while updating city: ${error.message}`);
    }
  }
}

module.exports = CityRepository;