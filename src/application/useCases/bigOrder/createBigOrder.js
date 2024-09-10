const BigOrder = require("../../../domain/models/BigOrder");
const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");

class CreateBigOrderUseCase {
    constructor(bigOrderRepository) {
        this.bigOrderRepository = bigOrderRepository
    }

    async execute(date, cityId, platformId) {
        const existBigOrder = await this.bigOrderRepository.findByDate(date, cityId, platformId)

        if (existBigOrder) {
            throw new Error("Ya existe un pedido generado");
        } else {
            const newBigOrder = new BigOrder(null, date, cityId, platformId);
            return this.bigOrderRepository.create(newBigOrder);
        }
    }
}

module.exports = new CreateBigOrderUseCase(new BigOrderRepository());
