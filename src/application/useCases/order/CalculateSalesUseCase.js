const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");
const SalesCalculationLogRepository = require("../../../infrastructure/persistence/repositories/SalesCalculationLogRepository");

class CalculateSalesUseCase {
    constructor(orderRepository, salesCalculationLogRepository) {
        this.orderRepository = orderRepository;
        this.salesCalculationLogRepository = salesCalculationLogRepository;
    }

    async execute(shopId, date, context = {}) {
        const source = ['scheduled_job', 'manual_admin'].includes(context.source)
            ? context.source
            : 'unknown';
        const audit = {
            source,
            status: 'error',
            targetDate: date,
            shop: shopId,
            currentOrder: {},
            nextOrder: {},
            calculations: [],
        };

        const saveAudit = async () => {
            try {
                await this.salesCalculationLogRepository.create(audit);
            } catch (auditError) {
                console.error('No se pudo guardar la auditoría de ventas:', auditError.message);
            }
        };

        const targetDate = new Date(date);

        try {
            const currentOrder = await this.orderRepository.getOrderByDateAndShop(targetDate.toISOString(), shopId);
            audit.currentOrder = {
                id: currentOrder?._id || null,
                date: currentOrder?.date || null,
                detailsCount: currentOrder?.orderDetails?.length || 0,
            };
            if (!currentOrder) {
                throw new Error("No se encontró la orden del día indicado.");
            }

            let nextDate = new Date(targetDate);
            let nextOrder = null;

            for (let i = 1; i <= 10; i++) {
                nextDate.setDate(nextDate.getDate() + 1);
                nextOrder = await this.orderRepository.getOrderByDateAndShop(nextDate.toISOString(), shopId);
                if (nextOrder) break;
            }

            audit.nextOrder = {
                id: nextOrder?._id || null,
                date: nextOrder?.date || null,
                detailsCount: nextOrder?.orderDetails?.length || 0,
            };
            if (!nextOrder) {
                throw new Error("No se encontró ninguna orden siguiente para calcular ventas.");
            }

            const nextInveMap = new Map();
            for (const detail of nextOrder.orderDetails) {
                nextInveMap.set(detail.product.toString(), parseFloat(detail.INVE || "0"));
            }

            const updatedDetails = currentOrder.orderDetails.map(currentDetail => {
                const productId = currentDetail.product.toString();
                const inveFinal = nextInveMap.get(productId) || 0;
                const inveInicial = parseFloat(currentDetail.INVE || "0");
                const averiaInicial = parseFloat(currentDetail.AVER || "0");
                const recibidoInicial = parseFloat(currentDetail.RECI || "0");

                const venta = inveInicial - averiaInicial + recibidoInicial - inveFinal;
                audit.calculations.push({
                    product: currentDetail.product,
                    inveInicial,
                    averiaInicial,
                    recibidoInicial,
                    inveFinal,
                    venta,
                });

                return {
                    product: currentDetail.product,
                    INVE: currentDetail.INVE,
                    AVER: currentDetail.AVER,
                    LOTE: currentDetail.LOTE,
                    RECI: currentDetail.RECI,
                    PEDI: currentDetail.PEDI,
                    VENT: venta.toString(),
                    PEDI_REAL: currentDetail.PEDI_REAL,
                    cost: currentDetail.cost,
                    salePrice: currentDetail.salePrice,
                    RENT: currentDetail.RENT,
                };
            });

            await this.orderRepository.update(currentOrder._id, { orderDetails: updatedDetails });
            audit.status = 'success';
            await saveAudit();

            return updatedDetails;
        } catch (error) {
            audit.error = error.message;
            await saveAudit();
            throw error;
        }
    }
}

module.exports = new CalculateSalesUseCase(new OrderRepository(), new SalesCalculationLogRepository());