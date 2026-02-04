const mongoose = require('mongoose');
const OrderModel = require('../../../infrastructure/persistence/models/OrderModel');

class CompareOrdersByMonthYearUseCase {
    async execute(shopId, monthA, yearA, monthB, yearB) {
        const shopObjId = new mongoose.Types.ObjectId(shopId);

        // Normaliza a enteros
        const mA = parseInt(monthA, 10);
        const yA = parseInt(yearA, 10);
        const mB = parseInt(monthB, 10);
        const yB = parseInt(yearB, 10);

        // Rango de fechas por mes
        const startA = new Date(yA, mA - 1, 1);
        const endA   = new Date(yA, mA, 0, 23, 59, 59, 999);
        const startB = new Date(yB, mB - 1, 1);
        const endB   = new Date(yB, mB, 0, 23, 59, 59, 999);

        // Consulta por mes
        const ordersA = await OrderModel.find({ shop: shopObjId, date: { $gte: startA, $lte: endA } });
        const ordersB = await OrderModel.find({ shop: shopObjId, date: { $gte: startB, $lte: endB } });

        // Conversión segura
        const toIntSafe = (val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 0 : num;
        };

        // Suma por órdenes
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

        const finalReport = [
            { _id: { year: yA, month: mA }, ...totalsA },
            { _id: { year: yB, month: mB }, ...totalsB }
        ];

        console.log("📊 Reporte final:", JSON.stringify(finalReport, null, 2));
        return finalReport;
    }
}

module.exports = new CompareOrdersByMonthYearUseCase();