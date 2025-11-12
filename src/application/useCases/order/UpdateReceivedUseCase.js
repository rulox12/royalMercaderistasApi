const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class UpdateReceivedUseCase {
    static async execute(shopId, date) {
        const orderRepository = new OrderRepository();
        // OJO: aquí no uses .lean() en el repositorio, necesitamos un documento Mongoose
        const order = await orderRepository.getOrderByDateAndShop(date, shopId);

        if (!order) {
            throw new Error("No se encontró la orden para la fecha indicada.");
        }

        for (const detail of order.orderDetails) {
            const originalRECI = detail.RECI;
            const PEDI = detail.PEDI;
            const newRECI =
                originalRECI === "" || originalRECI === null || originalRECI === undefined
                    ? PEDI
                    : originalRECI;

            if (originalRECI !== newRECI) {
                detail.RECI = newRECI; // mutamos directamente el subdocumento
                console.log(`📝 RECI corregido: ${originalRECI} → ${newRECI}`);
            }
        }

        // avisamos a Mongoose que el array fue modificado
        order.markModified("orderDetails");
        await order.save(); // persistimos en Mongo

        return order.orderDetails;
    }
}

module.exports = UpdateReceivedUseCase;