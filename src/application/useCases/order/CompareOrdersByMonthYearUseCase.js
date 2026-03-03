const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class CompareOrdersByMonthYearUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    parseDateStart(dateString) {
        const parsedDate = new Date(dateString);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error(`Fecha inválida: ${dateString}`);
        }
        parsedDate.setUTCHours(0, 0, 0, 0);
        return parsedDate;
    }

    parseDateEnd(dateString) {
        const parsedDate = new Date(dateString);
        if (Number.isNaN(parsedDate.getTime())) {
            throw new Error(`Fecha inválida: ${dateString}`);
        }
        parsedDate.setUTCHours(23, 59, 59, 999);
        return parsedDate;
    }

    async execute(shopId, startDateA, endDateA, startDateB, endDateB) {
        const startA = this.parseDateStart(startDateA);
        const endA = this.parseDateEnd(endDateA);
        const startB = this.parseDateStart(startDateB);
        const endB = this.parseDateEnd(endDateB);

        if (startA > endA || startB > endB) {
            throw new Error('La fecha inicial no puede ser mayor a la fecha final');
        }

        const ordersA = await this.orderRepository.getOrdersByShopAndDateRange(shopId, startA, endA);
        const ordersB = await this.orderRepository.getOrdersByShopAndDateRange(shopId, startB, endB);

        const toIntSafe = (val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 0 : num;
        };

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
            {
                _id: { startDate: startDateA, endDate: endDateA },
                ...totalsA
            },
            {
                _id: { startDate: startDateB, endDate: endDateB },
                ...totalsB
            }
        ];
    }
}

module.exports = new CompareOrdersByMonthYearUseCase(new OrderRepository());