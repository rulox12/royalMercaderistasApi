const Platform = require("../../../domain/models/Platform");
const PlatformRepository = require("../../../infrastructure/persistence/repositories/PlatformRepository");

class CreatePlatformUseCase {
  constructor(platformRepository) {
    this.platformRepository = platformRepository;
  }

  async execute(name, nit) {
    const existingPlatform = await this.platformRepository.findByNit(nit);
    console.log(existingPlatform);
    if (existingPlatform) {
      throw new Error("Ya existe la plataforma");
    }

    const platform = new Platform(null, name, nit);
    return await this.platformRepository.create(platform);
  }
}

module.exports = new CreatePlatformUseCase(new PlatformRepository());
