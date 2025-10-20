const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');

class CreateOrderDetailsUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(orderId, productsByDate) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        const orderDetails = [];

        for (const productId in productsByDate) {
            const product = productsByDate[productId];
            const existingDetailIndex = order.orderDetails.findIndex(detail => detail.product.equals(productId));

            const { INVE, AVER, LOTE, RECI, PEDI, VENT } = product;

            const orderDetail = {
                product: productId,
                INVE,
                AVER,
                LOTE,
                RECI: RECI === "" || RECI === null || RECI === undefined ? PEDI : RECI,
                PEDI,
                VENT,
            };

            if (existingDetailIndex !== -1) {
                const existingDetail = order.orderDetails[existingDetailIndex];
                existingDetail.INVE = INVE;
                existingDetail.AVER = AVER;
                existingDetail.LOTE = LOTE;
                existingDetail.RECI = RECI === "" || RECI === null || RECI === undefined ? PEDI : RECI;
                existingDetail.PEDI = PEDI;
                existingDetail.VENT = VENT;
                existingDetail.PEDI_REAL = PEDI;
                order.orderDetails[existingDetailIndex] = existingDetail;
                orderDetails.push(existingDetail);
            } else {
                orderDetail.PEDI_REAL = PEDI;
                order.orderDetails.push(orderDetail);
                orderDetails.push(orderDetail);
            }
        }

        await order.save();

        return orderDetails;
    }
}

module.exports = new CreateOrderDetailsUseCase(new OrderRepository());