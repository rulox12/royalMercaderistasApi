const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");

class GetBigOrdersUseCase {
  constructor(bigOrderRepository) {
    this.bigOrderRepository = bigOrderRepository;
  }

  async execute(filters, page, limit = '') {
    return this.bigOrderRepository.getAll(filters, page, limit);
  }
}

module.exports = new GetBigOrdersUseCase(new BigOrderRepository());
