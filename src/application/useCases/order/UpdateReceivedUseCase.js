const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class UpdateReceivedUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(shopId, date) {
        // Parse date string to ISO format for MongoDB query
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            throw new Error(`Fecha inválida recibida: ${date}`);
        }

        const order = await this.orderRepository.getOrderByDateAndShop(targetDate.toISOString(), shopId);

        if (!order) {
            throw new Error("No se encontró la orden para la fecha indicada.");
        }

        let hasChanges = false;
        for (const detail of order.orderDetails) {
            const originalRECI = detail.RECI;
            const PEDI = detail.PEDI;
            const newRECI =
                originalRECI === "" || originalRECI === null || originalRECI === undefined
                    ? PEDI
                    : originalRECI;

            if (originalRECI !== newRECI) {
                detail.RECI = newRECI;
                console.log(`📝 RECI corregido: ${originalRECI} → ${newRECI}`);
                hasChanges = true;
            }
        }

        // Mark modified and save
        if (hasChanges) {
            order.markModified("orderDetails");
            await order.save();
        }

        return order.orderDetails;
    }
}

module.exports = new UpdateReceivedUseCase(new OrderRepository());