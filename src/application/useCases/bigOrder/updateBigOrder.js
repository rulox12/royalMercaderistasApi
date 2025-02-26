const Order = require("../../../domain/models/Order");
const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");

class UpdateBigOrder {
    constructor(bigOrderRepository, orderRepository) {
        this.bigOrderRepository = bigOrderRepository;
        this.orderRepository = orderRepository;
    }

    async execute(bigOrderId, products, userId) {
        try {
            const bigOrder = await this.bigOrderRepository.findById(bigOrderId);
            if (!bigOrder) {
                throw new Error("BigOrder not found");
            }

            for (const key in products) {
                if (Object.hasOwnProperty.call(products, key)) {
                    const [productId, shopId] = key.split('_');
                    const quantity = products[key];
                    let orderId;

                    let order = await this.orderRepository.getOrderByDateAndShop(bigOrder.date, shopId);
                    if (order) {
                        orderId = order._id;
                        order.status = "APPROVED";
                    } else {
                        const newOrder = new Order(null, bigOrder.date, shopId, 'APPROVED', userId, bigOrder.cityId,bigOrder.platformId,[] );
                        order = await this.orderRepository.create(newOrder);
                        orderId = order._id;
                    }

                    let orderDetail = order.orderDetails.find(detail => detail.product.equals(productId));
                    if (orderDetail) {
                        orderDetail.PEDI_REAL = quantity;
                    } else {
                        orderDetail = {
                            product: productId,
                            INVE: 0,
                            AVER: 0,
                            LOTE: 0,
                            RECI: 0,
                            VENT: 0,
                            PEDI: quantity,
                            PEDI_REAL: quantity
                        };
                        order.orderDetails.push(orderDetail);
                    }
                    await order.save();
                }
            }

            await this.bigOrderRepository.update(bigOrderId, { status: "Approved" });
        } catch (error) {
            throw new Error(`Error updating BigOrder: ${error.message}`);
        }
    }
}

module.exports = new UpdateBigOrder(
    new BigOrderRepository(),
    new OrderRepository()
);
