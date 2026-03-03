const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class ComparePlatformCitiesUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    parseDateStart(dateStr) {
        if (!dateStr) return null;
        const date = new Date(`${dateStr}T00:00:00Z`);
        return date;
    }

    parseDateEnd(dateStr) {
        if (!dateStr) return null;
        const date = new Date(`${dateStr}T23:59:59.999Z`);
        return date;
    }

    async execute(platformId, startDateA, endDateA, startDateB, endDateB) {
        const startA = this.parseDateStart(startDateA);
        const endA = this.parseDateEnd(endDateA);

        const startB = this.parseDateStart(startDateB);
        const endB = this.parseDateEnd(endDateB);

        // 🔹 Consulta separada para cada rango de fechas
        const ordersA =
            await this.orderRepository.getOrdersByPlatformAndDateRange(
                platformId,
                [{ start: startA, end: endA }]
            );

        const ordersB =
            await this.orderRepository.getOrdersByPlatformAndDateRange(
                platformId,
                [{ start: startB, end: endB }]
            );

        const toIntSafe = (val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 0 : num;
        };

        const toFloatSafe = (val) => {
            const num = parseFloat(val);
            return Number.isFinite(num) ? num : 0;
        };

        const cityTotals = {};

        // 🔹 Procesar ordersA
        for (const order of ordersA) {
            const cityName = order.cityId?.name || "Sin ciudad";

            if (!cityTotals[cityName]) {
                cityTotals[cityName] = {
                    monthA: { ventasCantidad: 0, ventasValor: 0, averias: 0, rentabilidad: 0 },
                    monthB: { ventasCantidad: 0, ventasValor: 0, averias: 0, rentabilidad: 0 },
                };
            }

            for (const detail of order.orderDetails || []) {
                const vent = toIntSafe(detail.VENT);
                const salePrice = toFloatSafe(detail.salePrice);

                // Ventas en cantidad (unidades)
                cityTotals[cityName].monthA.ventasCantidad += vent;

                // Ventas en valor (total ingreso)
                cityTotals[cityName].monthA.ventasValor += vent * salePrice;

                // Averías
                cityTotals[cityName].monthA.averias += toIntSafe(detail.AVER);

                // Rentabilidad: sumar campo RENT (ya calculado)
                cityTotals[cityName].monthA.rentabilidad += toFloatSafe(detail.RENT);
            }
        }

        // 🔹 Procesar ordersB
        for (const order of ordersB) {
            const cityName = order.cityId?.name || "Sin ciudad";

            if (!cityTotals[cityName]) {
                cityTotals[cityName] = {
                    monthA: { ventasCantidad: 0, ventasValor: 0, averias: 0, rentabilidad: 0 },
                    monthB: { ventasCantidad: 0, ventasValor: 0, averias: 0, rentabilidad: 0 },
                };
            }

            for (const detail of order.orderDetails || []) {
                const vent = toIntSafe(detail.VENT);
                const salePrice = toFloatSafe(detail.salePrice);

                cityTotals[cityName].monthB.ventasCantidad += vent;
                cityTotals[cityName].monthB.ventasValor += vent * salePrice;
                cityTotals[cityName].monthB.averias += toIntSafe(detail.AVER);
                cityTotals[cityName].monthB.rentabilidad += toFloatSafe(detail.RENT);
            }
        }

        return Object.entries(cityTotals).map(([city, totals]) => ({
            city,
            ...totals,
        }));
    }
}

module.exports = new ComparePlatformCitiesUseCase(new OrderRepository());
