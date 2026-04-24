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

        // 🔹 Determinar cuál rango es más antiguo
        const isAOlder = startA <= startB;
        const olderStart = isAOlder ? startA : startB;
        const olderEnd = isAOlder ? endA : endB;
        const newerStart = isAOlder ? startB : startA;
        const newerEnd = isAOlder ? endB : endA;

        // 🔹 Consulta separada para cada rango de fechas
        const ordersOlder =
            await this.orderRepository.getOrdersByPlatformAndDateRange(
                platformId,
                [{ start: olderStart, end: olderEnd }]
            );

        const ordersNewer =
            await this.orderRepository.getOrdersByPlatformAndDateRange(
                platformId,
                [{ start: newerStart, end: newerEnd }]
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

        // 🔹 Procesar ordersOlder → monthA (siempre el rango más antiguo)
        for (const order of ordersOlder) {
            const cityName = order.cityId?.name || "Sin ciudad";

            if (!cityTotals[cityName]) {
                cityTotals[cityName] = {
                    monthA: { ventasCantidad: 0, ventasValor: 0, averias: 0, averiasValor: 0, rentabilidad: 0 },
                    monthB: { ventasCantidad: 0, ventasValor: 0, averias: 0, averiasValor: 0, rentabilidad: 0 },
                };
            }

            for (const detail of order.orderDetails || []) {
                const vent = toIntSafe(detail.VENT);
                const salePrice = toFloatSafe(detail.salePrice);
                const cost = toFloatSafe(detail.cost);

                // Ventas en cantidad (unidades)
                cityTotals[cityName].monthA.ventasCantidad += vent;

                // Ventas en valor (total ingreso)
                cityTotals[cityName].monthA.ventasValor += vent * salePrice;

                // Averías
                const aver = toIntSafe(detail.AVER);
                cityTotals[cityName].monthA.averias += aver;
                cityTotals[cityName].monthA.averiasValor += aver * cost;

                // Rentabilidad: sumar campo RENT (ya calculado)
                cityTotals[cityName].monthA.rentabilidad += toFloatSafe(detail.RENT);
            }
        }

        // 🔹 Procesar ordersNewer → monthB (siempre el rango más reciente)
        for (const order of ordersNewer) {
            const cityName = order.cityId?.name || "Sin ciudad";

            if (!cityTotals[cityName]) {
                cityTotals[cityName] = {
                    monthA: { ventasCantidad: 0, ventasValor: 0, averias: 0, averiasValor: 0, rentabilidad: 0 },
                    monthB: { ventasCantidad: 0, ventasValor: 0, averias: 0, averiasValor: 0, rentabilidad: 0 },
                };
            }

            for (const detail of order.orderDetails || []) {
                const vent = toIntSafe(detail.VENT);
                const salePrice = toFloatSafe(detail.salePrice);
                const cost = toFloatSafe(detail.cost);

                cityTotals[cityName].monthB.ventasCantidad += vent;
                cityTotals[cityName].monthB.ventasValor += vent * salePrice;
                const aver = toIntSafe(detail.AVER);
                cityTotals[cityName].monthB.averias += aver;
                cityTotals[cityName].monthB.averiasValor += aver * cost;
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
