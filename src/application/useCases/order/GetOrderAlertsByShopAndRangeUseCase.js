const moment = require("moment");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

const PENDING_CORRECTION_STATUS = "PendingCorrection";

class GetOrderAlertsByShopAndRangeUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(shopId, startDate, endDate) {
        const start = moment.utc(startDate, "YYYY-MM-DD", true);
        const end = moment.utc(endDate, "YYYY-MM-DD", true);

        if (!start.isValid() || !end.isValid() || start.isAfter(end, "day")) {
            throw new RangeError("Rango de fechas inválido");
        }

        const orders = await this.orderRepository.getOrdersByShopAndDateRange(
            shopId,
            start.startOf("day").toDate(),
            end.endOf("day").toDate(),
        );

        // Los domingos no se espera orden, no generan alerta.
        const weekdayOrders = orders
            .filter((order) => moment.utc(order.date).day() !== 0)
            .sort((first, second) => second.date - first.date);

        // Incompleta: alguien registró averías o pedido en algún producto,
        // pero ningún producto tiene inventario inicial.
        const incompleteOrders = weekdayOrders
            .filter((order) => {
                const details = order.orderDetails ?? [];
                const hasMovement = details.some(
                    (detail) => hasValue(detail.AVER) || hasValue(detail.PEDI),
                );
                const hasInventory = details.some((detail) => hasValue(detail.INVE));
                return hasMovement && !hasInventory;
            })
            .map((order) => ({
                orderId: order._id,
                date: moment.utc(order.date).format("YYYY-MM-DD"),
            }));

        const pendingCorrectionOrders = weekdayOrders
            .filter((order) => order.status === PENDING_CORRECTION_STATUS)
            .map((order) => ({
                orderId: order._id,
                date: moment.utc(order.date).format("YYYY-MM-DD"),
            }));

        return { incompleteOrders, pendingCorrectionOrders };
    }
}

function hasValue(value) {
    return value !== null && value !== undefined && String(value).trim() !== "";
}

module.exports = new GetOrderAlertsByShopAndRangeUseCase(new OrderRepository());
module.exports.PENDING_CORRECTION_STATUS = PENDING_CORRECTION_STATUS;
