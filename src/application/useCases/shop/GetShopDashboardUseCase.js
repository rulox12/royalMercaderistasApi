const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');
const ProductRepository = require('../../../infrastructure/persistence/repositories/ProductRepository');
const ListRepository = require('../../../infrastructure/persistence/repositories/ListRepository');

class GetShopDashboardUseCase {
    constructor(orderRepository, productRepository, listRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.listRepository = listRepository;
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

        const toIntSafe = (v) => {
            const n = parseInt(v, 10);
            return isNaN(n) ? 0 : n;
        };

        const toFloatSafe = (v) => {
            const n = parseFloat(v);
            return Number.isFinite(n) ? n : 0;
        };

        // Aggregate indicators and products
        const indicators = {
            pedidos: { monthA: { valor: 0, unidades: 0 }, monthB: { valor: 0, unidades: 0 } },
            recibidos: { monthA: { valor: 0, unidades: 0 }, monthB: { valor: 0, unidades: 0 } },
            averias: { monthA: { valor: 0, unidades: 0 }, monthB: { valor: 0, unidades: 0 } },
            ventas: { monthA: { valor: 0, unidades: 0 }, monthB: { valor: 0, unidades: 0 } },
            rentabilidad: { monthA: { valor: 0, unidades: 0 }, monthB: { valor: 0, unidades: 0 } },
        };

        const productMap = new Map(); // key: productId, value: { name, data: {...} }

        // Process orders A
        for (const order of ordersA) {
            for (const detail of order.orderDetails || []) {
                const productId = detail.product.toString();
                const pedi = toIntSafe(detail.PEDI);
                const reci = toIntSafe(detail.RECI);
                const aver = toIntSafe(detail.AVER);
                const vent = toIntSafe(detail.VENT);
                const salePrice = toFloatSafe(detail.salePrice);
                const rent = toFloatSafe(detail.RENT);

                // Update indicators
                indicators.pedidos.monthA.unidades += pedi;
                indicators.pedidos.monthA.valor += pedi * salePrice;

                indicators.recibidos.monthA.unidades += reci;
                indicators.recibidos.monthA.valor += reci * salePrice;

                indicators.averias.monthA.unidades += aver;
                indicators.averias.monthA.valor += aver * salePrice;

                indicators.ventas.monthA.unidades += vent;
                indicators.ventas.monthA.valor += vent * salePrice;

                indicators.rentabilidad.monthA.valor += rent;

                // Track product data
                if (!productMap.has(productId)) {
                    const productName = detail.product?.name || 'Producto desconocido';
                    productMap.set(productId, {
                        name: productName,
                        pedidosA: 0,
                        pedidosB: 0,
                        recibidosA: 0,
                        recibidosB: 0,
                        averiasA: 0,
                        averiasB: 0,
                        ventasA: 0,
                        ventasB: 0,
                        rentabilidadA: 0,
                        rentabilidadB: 0,
                    });
                }

                const prod = productMap.get(productId);
                prod.pedidosA += pedi;
                prod.recibidosA += reci;
                prod.averiasA += aver;
                prod.ventasA += vent * salePrice;
                prod.rentabilidadA += rent;
            }
        }

        // Process orders B
        for (const order of ordersB) {
            for (const detail of order.orderDetails || []) {
                const productId = detail.product.toString();
                const pedi = toIntSafe(detail.PEDI);
                const reci = toIntSafe(detail.RECI);
                const aver = toIntSafe(detail.AVER);
                const vent = toIntSafe(detail.VENT);
                const salePrice = toFloatSafe(detail.salePrice);
                const rent = toFloatSafe(detail.RENT);

                // Update indicators
                indicators.pedidos.monthB.unidades += pedi;
                indicators.pedidos.monthB.valor += pedi * salePrice;

                indicators.recibidos.monthB.unidades += reci;
                indicators.recibidos.monthB.valor += reci * salePrice;

                indicators.averias.monthB.unidades += aver;
                indicators.averias.monthB.valor += aver * salePrice;

                indicators.ventas.monthB.unidades += vent;
                indicators.ventas.monthB.valor += vent * salePrice;

                indicators.rentabilidad.monthB.valor += rent;

                // Track product data
                if (!productMap.has(productId)) {
                    const productName = detail.product?.name || 'Producto desconocido';
                    productMap.set(productId, {
                        name: productName,
                        pedidosA: 0,
                        pedidosB: 0,
                        recibidosA: 0,
                        recibidosB: 0,
                        averiasA: 0,
                        averiasB: 0,
                        ventasA: 0,
                        ventasB: 0,
                        rentabilidadA: 0,
                        rentabilidadB: 0,
                    });
                }

                const prod = productMap.get(productId);
                prod.pedidosB += pedi;
                prod.recibidosB += reci;
                prod.averiasB += aver;
                prod.ventasB += vent * salePrice;
                prod.rentabilidadB += rent;
            }
        }

        // Convert product map to array
        const products = Array.from(productMap.values()).sort((a, b) => b.ventasA - a.ventasA);

        return {
            indicators,
            products,
        };
    }
}

module.exports = new GetShopDashboardUseCase(
    new OrderRepository(),
    new ProductRepository(),
    new ListRepository()
);
