const PlatformModel = require("../models/PlatformModel");

class PlatformRepository {
  async create(role) {
    const newPlatform = new PlatformModel(role);
    await newPlatform.save();

    return newPlatform.toObject();
  }

  async findById(platformId) {
    return PlatformModel.findById(platformId).exec();
  }

  async findByNit(nit) {
    return PlatformModel.findOne({nit}).exec();
  }

  async getAll() {
    try {
      const platforms = await PlatformModel.find();
      return platforms;
    } catch (error) {
      throw new Error(`Error while fetching platforms: ${error.message}`);
    }
  }
}

module.exports = PlatformRepository;