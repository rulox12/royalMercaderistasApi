const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class UpdateRentabilityUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    // shopId: string, date: 'YYYY-MM-DD' or any parsable date string
    async execute(shopId, date) {
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            throw new Error(`Fecha inválida recibida: ${date}`);
        }

        // Try to find the order for that shop and date
        const currentOrder = await this.orderRepository.getOrderByDateAndShop(targetDate.toISOString(), shopId);
        if (!currentOrder) {
            throw new Error('No se encontró la orden para la tienda y fecha indicadas.');
        }

        // Safe number parser
        const toFloatSafe = (v) => {
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : 0;
        };

        // Update RENT per detail = (salePrice - cost) * VENT
        for (const detail of (currentOrder.orderDetails || [])) {
            const sale = toFloatSafe(detail.salePrice);
            const cost = toFloatSafe(detail.cost);
            const vent = toFloatSafe(detail.VENT);
            const rent = (sale - cost) * vent;
            detail.RENT = rent.toString();
        }

        // Mark modified and persist
        currentOrder.markModified("orderDetails");
        await currentOrder.save();

        return currentOrder.orderDetails;
    }
}

module.exports = new UpdateRentabilityUseCase(new OrderRepository());