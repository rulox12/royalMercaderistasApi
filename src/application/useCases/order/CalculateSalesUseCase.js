const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class CalculateSalesUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(shopId, date) {
        const targetDate = new Date(date);

        // Obtener la orden actual (la que se quiere calcular)
        const currentOrder = await this.orderRepository.getOrderByDateAndShop(targetDate.toISOString(), shopId);
        if (!currentOrder) {
            throw new Error("No se encontró la orden del día indicado.");
        }

        // Ir hacia adelante hasta encontrar la próxima orden
        let nextDate = new Date(targetDate);
        let nextOrder = null;

        for (let i = 1; i <= 10; i++) {
            nextDate.setDate(nextDate.getDate() + 1);
            nextOrder = await this.orderRepository.getOrderByDateAndShop(nextDate.toISOString(), shopId);
            if (nextOrder) break;
        }

        if (!nextOrder) {
            throw new Error("No se encontró ninguna orden siguiente para calcular ventas.");
        }

        // Mapear INVE del siguiente día
        const nextInveMap = new Map();
        for (const detail of nextOrder.orderDetails) {
            nextInveMap.set(detail.product.toString(), parseFloat(detail.INVE || "0"));
        }

        // Construir nuevos detalles actualizados
        const updatedDetails = currentOrder.orderDetails.map(currentDetail => {
            const productId = currentDetail.product.toString();
            const inveFinal = nextInveMap.get(productId) || 0;
            const inveInicial = parseFloat(currentDetail.INVE || "0");
            const venta = inveInicial - inveFinal;

            return {
                product: currentDetail.product,
                INVE: currentDetail.INVE,
                AVER: currentDetail.AVER,
                LOTE: currentDetail.LOTE,
                RECI: currentDetail.RECI,
                PEDI: currentDetail.PEDI,
                VENT: venta.toString(),
                PEDI_REAL: currentDetail.PEDI_REAL
            };
        });

        // Guardar los cambios en la orden actual
        await this.orderRepository.update(currentOrder._id, {
            orderDetails: updatedDetails
        });

        return updatedDetails;
    }
}

module.exports = new CalculateSalesUseCase(new OrderRepository());