const OrderRepository = require('../../../infrastructure/persistence/repositories/OrderRepository');
const ShopModel = require('../../../infrastructure/persistence/models/ShopModel');
const ListProduct = require('../../../infrastructure/persistence/models/ListProductModel');

class CreateOrderDetailsUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(orderId, productsByDate) {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        const shop = await ShopModel.findById(order.shop);
        if (!shop) {
            throw new Error('Shop not found');
        }

        const orderDetails = [];

        for (const productId in productsByDate) {
            const product = productsByDate[productId];
            const existingDetailIndex = order.orderDetails.findIndex(detail => detail.product.equals(productId));

            const {INVE, AVER, LOTE, RECI, PEDI, VENT, RENT} = product;

            // Buscar el precio en la lista de la tienda
            const listProduct = await ListProduct.findOne({
                listId: shop.listId,
                productId: productId
            });

            if (!listProduct) {
                throw new Error(`Price list entry not found for product ${productId}`);
            }

            const orderDetail = {
                product: productId,
                cost: listProduct.cost,
                salePrice: listProduct.salePrice,
                INVE,
                AVER,
                LOTE,
                RECI,
                PEDI,
                VENT,
                RENT: ''
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
                existingDetail.RENT = RENT;

                existingDetail.cost = listProduct.cost;
                existingDetail.salePrice = listProduct.salePrice;
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