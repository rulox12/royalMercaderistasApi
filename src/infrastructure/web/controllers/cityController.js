const CreateCityUseCase = require('../../../application/useCases/city/createCity');
const GetCityUseCase = require('../../../application/useCases/city/getCity');
const GetCitiesUseCase = require('../../../application/useCases/city/getCities');

const cityController = {
  createCity: async (req, res) => {
    try {
      const { name, department } = req.body;
      
      const createdCity = await CreateCityUseCase.execute(name, department);

      res.status(201).json(createdCity);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCity: async (req, res) => {
    try {
      const cityId = req.params.cityId;
      const city = await GetCityUseCase.execute(cityId);

      if (!city) {
        return res.status(404).json({ message: "Lista no encontrada" });
      }

      res.status(200).json(city);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCities: async (req, res) => {
    try {
      const cities = await GetCitiesUseCase.execute();

      if (!cities) {
        return res.status(404).json({ message: "No se encontraron Ciudades" });
      }

      res.status(200).json(cities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = cityController;
