const RealSaleRepository = require('../../../infrastructure/persistence/repositories/RealSaleRepository');

class UpdateRealSaleUseCase {
    constructor(realSaleRepository) {
        this.realSaleRepository = realSaleRepository;
    }

    async execute(realSaleId, data) {
        return this.realSaleRepository.update(realSaleId, data);
    }
}

module.exports = new UpdateRealSaleUseCase(new RealSaleRepository());