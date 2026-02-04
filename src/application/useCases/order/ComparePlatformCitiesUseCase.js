const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ComparePlatformCitiesUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(platformId, monthA, yearA, monthB, yearB) {
        const startMonthA = new Date(yearA, monthA - 1, 1);
        const endMonthA = new Date(yearA, monthA, 0, 23, 59, 59);

        const startMonthB = new Date(yearB, monthB - 1, 1);
        const endMonthB = new Date(yearB, monthB, 0, 23, 59, 59);

        // 🔹 Consulta separada para cada mes
        const ordersA =
            await this.orderRepository.getOrdersByPlatformAndDateRange(
                platformId,
                [{ start: startMonthA, end: endMonthA }]
            );

        const ordersB =
            await this.orderRepository.getOrdersByPlatformAndDateRange(
                platformId,
                [{ start: startMonthB, end: endMonthB }]
            );

        const toIntSafe = (val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 0 : num;
        };

        const cityTotals = {};

        // 🔹 Procesar ordersA
        for (const order of ordersA) {
            const cityName = order.cityId?.name || "Sin ciudad";

            if (!cityTotals[cityName]) {
                cityTotals[cityName] = {
                    monthA: { ventas: 0, averias: 0, rentabilidad: 0 },
                    monthB: { ventas: 0, averias: 0, rentabilidad: 0 },
                };
            }

            for (const detail of order.orderDetails || []) {
                cityTotals[cityName].monthA.ventas += toIntSafe(detail.VENT);
                cityTotals[cityName].monthA.averias += toIntSafe(detail.AVER);
                cityTotals[cityName].monthA.rentabilidad +=
                    toIntSafe(detail.salePrice) - toIntSafe(detail.cost);
            }
        }

        // 🔹 Procesar ordersB
        for (const order of ordersB) {
            const cityName = order.cityId?.name || "Sin ciudad";

            if (!cityTotals[cityName]) {
                cityTotals[cityName] = {
                    monthA: { ventas: 0, averias: 0, rentabilidad: 0 },
                    monthB: { ventas: 0, averias: 0, rentabilidad: 0 },
                };
            }

            for (const detail of order.orderDetails || []) {
                cityTotals[cityName].monthB.ventas += toIntSafe(detail.VENT);
                cityTotals[cityName].monthB.averias += toIntSafe(detail.AVER);
                cityTotals[cityName].monthB.rentabilidad +=
                    toIntSafe(detail.salePrice) - toIntSafe(detail.cost);
            }
        }

        return Object.entries(cityTotals).map(([city, totals]) => ({
            city,
            ...totals,
        }));
    }
}

module.exports = new ComparePlatformCitiesUseCase(new OrderRepository());
