const RealSale = require('../../../domain/models/RealSale');
const RealSaleRepository = require('../../../infrastructure/persistence/repositories/RealSaleRepository');

class CreateRealSaleUseCase {
    constructor(realSaleRepository) {
        this.realSaleRepository = realSaleRepository;
    }

    async execute(data) {
        const {
            platformId,
            cityId,
            shopId,
            startDate,
            endDate,
            categories,
        } = data;

        const realSale = new RealSale(
            null,
            platformId,
            cityId,
            shopId,
            this.parseDateOnly(startDate),
            this.parseDateOnly(endDate),
            categories,
        );

        return this.realSaleRepository.create(realSale);
    }

    parseDateOnly(dateString) {
        const parsedDate = new Date(dateString);

        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error(`Fecha inválida: ${dateString}`);
        }

        parsedDate.setUTCHours(0, 0, 0, 0);
        return parsedDate;
    }
}

module.exports = new CreateRealSaleUseCase(new RealSaleRepository());