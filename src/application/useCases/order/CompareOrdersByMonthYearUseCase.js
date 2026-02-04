const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class CompareOrdersByMonthYearUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(shopId, monthA, yearA, monthB, yearB) {
        // Fechas de inicio y fin para cada mes
        const startA = new Date(yearA, monthA - 1, 1);
        const endA   = new Date(yearA, monthA, 0, 23, 59, 59, 999);
        const startB = new Date(yearB, monthB - 1, 1);
        const endB   = new Date(yearB, monthB, 0, 23, 59, 59, 999);

        // Traer órdenes de cada mes usando el repositorio
        const ordersA = await this.orderRepository.getOrdersByShopAndDateRange(shopId, startA, endA);
        const ordersB = await this.orderRepository.getOrdersByShopAndDateRange(shopId, startB, endB);

        // Helper para convertir seguro
        const toIntSafe = (val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 0 : num;
        };

        // Función para sumar valores de un conjunto de órdenes
        const sumOrders = (orders) => {
            let ventas = 0, averias = 0, rentabilidad = 0;
            for (const order of orders) {
                for (const detail of order.orderDetails || []) {
                    ventas += toIntSafe(detail.VENT);
                    averias += toIntSafe(detail.AVER);
                    rentabilidad += (toIntSafe(detail.salePrice) - toIntSafe(detail.cost));
                }
            }
            return { ventas, averias, rentabilidad };
        };

        const totalsA = sumOrders(ordersA);
        const totalsB = sumOrders(ordersB);

        return [
            { _id: { year: yearA, month: monthA }, ...totalsA },
            { _id: { year: yearB, month: monthB }, ...totalsB }
        ];
    }
}

module.exports = new CompareOrdersByMonthYearUseCase(new OrderRepository());