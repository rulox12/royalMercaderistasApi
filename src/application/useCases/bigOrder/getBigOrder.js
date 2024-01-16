const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");

class GetBigOrderUseCase {
  constructor(bigOrderRepository) {
    this.bigOrderRepository = bigOrderRepository;
  }

  async execute(id) {
    return this.bigOrderRepository.findById(id);
  }
}

module.exports = new GetBigOrderUseCase(new BigOrderRepository());
