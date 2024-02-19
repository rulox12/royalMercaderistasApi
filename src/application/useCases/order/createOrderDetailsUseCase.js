const OrderDetailsRepository = require('../../../infrastructure/persistence/repositories/OrderDetailsRepository');

class CreateOrderDetailsUseCase {
    constructor(orderDetailsRepository) {
        this.orderDetailsRepository = orderDetailsRepository;
    }

    async execute(orderId, productsByDate) {
        const orderDetails = [];

        for (const productId in productsByDate) {
            const product = productsByDate[productId];
            const existingDetail = await this.orderDetailsRepository.findByOrderIdAndProductId(orderId, productId);

            const { INVE, AVER, LOTE, RECI, PEDI, VENT } = product;

            const orderDetail = {
                product: productId,
                INVE,
                AVER,
                LOTE,
                RECI,
                PEDI,
                VENT,
                order: orderId,
            };
            
            if (existingDetail) {
                const updatedOrderDetail = await this.orderDetailsRepository.update(existingDetail._id, orderDetail);
                orderDetails.push(updatedOrderDetail);
            } else {
                orderDetail['PEDI_REAL'] = PEDI;
                const createdOrderDetail = await this.orderDetailsRepository.create(orderDetail);
                orderDetails.push(createdOrderDetail);
            }
        }

        return orderDetails;
    }
}

module.exports = new CreateOrderDetailsUseCase(new OrderDetailsRepository());
