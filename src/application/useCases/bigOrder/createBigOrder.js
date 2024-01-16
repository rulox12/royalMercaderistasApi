const BigOrder = require("../../../domain/models/BigOrder");
const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");

class CreateBigOrderUseCase {
  constructor(bigOrderRepository) {
    this.bigOrderRepository = bigOrderRepository
  }

  async execute(date) {
    const existBigOrder = await this.bigOrderRepository.findByDate(date)

    if (existBigOrder) {
      throw new Error("Ya existe un pedido generada");
    } else {
      const newBigOrder = new BigOrder(null, date);
      const createdBigOrder = await this.bigOrderRepository.create(newBigOrder);
      return createdBigOrder;
    }
  }
}

module.exports = new CreateBigOrderUseCase(new BigOrderRepository());
