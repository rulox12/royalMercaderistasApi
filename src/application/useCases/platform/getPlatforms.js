const PlatformRepository = require("../../../infrastructure/persistence/repositories/PlatformRepository");

class GetPlatformsUseCase {
  constructor(platformRepository) {
    this.platformRepository = platformRepository;
  }

  async execute() {
    return this.platformRepository.getAll();
  }
}

module.exports = new GetPlatformsUseCase(new PlatformRepository());
