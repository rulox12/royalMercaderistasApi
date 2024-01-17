const PlatformRepository = require("../../../infrastructure/persistence/repositories/PlatformRepository");

class GetPlatformUseCase {
  constructor(platformRepository) {
    this.platformRepository = platformRepository;
  }

  async execute(platformId) {
    return this.platformRepository.findById(platformId);
  }
}

module.exports = new GetPlatformUseCase(new PlatformRepository);
