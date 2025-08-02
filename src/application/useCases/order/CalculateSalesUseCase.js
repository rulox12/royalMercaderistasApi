const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class CalculateSalesUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(shopId, date) {
        const targetDate = new Date(date);
        const nextOrder = await this.orderRepository.getOrderByDateAndShop(targetDate.toISOString(), shopId);
        console.log("Orden del día siguiente encontrada:", nextOrder ? nextOrder : "No encontrada");
        if (!nextOrder) {
            throw new Error("No se puede calcular ventas: falta la orden del día indicado.");
        }

        // Ir hacia atrás hasta encontrar una orden anterior
        let previousDate = new Date(targetDate);
        let previousOrder = null;

        for (let i = 1; i <= 10; i++) {
            previousDate.setDate(previousDate.getDate() - 1);
            previousOrder = await this.orderRepository.getOrderByDateAndShop(previousDate.toISOString(), shopId);
            if (previousOrder) break;
        }
        console.log("Orden anterior encontrada:", previousOrder ? previousOrder : "No encontrada");
        if (!previousOrder) {
            throw new Error("No se encontró ninguna orden anterior para calcular ventas.");
        }

        // Mapear INVE del día siguiente
        const nextInveMap = new Map();
        for (const detail of nextOrder.orderDetails) {
            nextInveMap.set(detail.product.toString(), parseFloat(detail.INVE || "0"));
        }

        // Construir nuevos detalles actualizados
        const updatedDetails = previousOrder.orderDetails.map(prevDetail => {
            const productId = prevDetail.product.toString();
            const inveInicial = nextInveMap.get(productId) || 0;
            const inveFinal = parseFloat(prevDetail.INVE || "0");
            const venta = inveInicial - inveFinal;
            
            return {
                product: prevDetail.product,
                INVE: prevDetail.INVE,
                AVER: prevDetail.AVER,
                LOTE: prevDetail.LOTE,
                RECI: prevDetail.RECI,
                PEDI: prevDetail.PEDI,
                VENT: venta.toString(),
                PEDI_REAL: prevDetail.PEDI_REAL
            };
        });

        // Guardar los cambios en la orden anterior
        await this.orderRepository.update(previousOrder._id, {
            orderDetails: updatedDetails
        });

        return updatedDetails;
    }
}

module.exports = new CalculateSalesUseCase(new OrderRepository());