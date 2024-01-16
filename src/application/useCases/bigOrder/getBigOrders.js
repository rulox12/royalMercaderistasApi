const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");

class GetBigOrdersUseCase {
  constructor(bigOrderRepository) {
    this.bigOrderRepository = bigOrderRepository;
  }

  async execute() {
    return this.bigOrderRepository.getAll();
  }
}

module.exports = new GetBigOrdersUseCase(new BigOrderRepository());
