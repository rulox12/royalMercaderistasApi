const Order = require("../../../domain/models/Order");
const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");
const ShopModel = require("../../../infrastructure/persistence/models/ShopModel");
const ListProduct = require("../../../infrastructure/persistence/models/ListProductModel");

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
                    const [productId, shopId] = key.split("_");
                    const productData = products[key];

                    let orderId;

                    let order =
                        await this.orderRepository.getOrderByDateAndShop(
                            bigOrder.date,
                            shopId,
                        );
                    if (order) {
                        orderId = order._id;
                        order.status = "APPROVED";
                    } else {
                        const newOrder = new Order(
                            null,
                            bigOrder.date,
                            shopId,
                            "APPROVED",
                            userId,
                            bigOrder.cityId,
                            bigOrder.platformId,
                            [],
                        );
                        order = await this.orderRepository.create(newOrder);
                        orderId = order._id;
                    }

                    let orderDetail = order.orderDetails.find((detail) =>
                        detail.product.equals(productId),
                    );
                    if (orderDetail) {
                        orderDetail.PEDI_REAL = productData.PEDI;
                    } else {
                        const shop = await ShopModel.findById(shopId);
                        if (!shop) {
                            throw new Error("Shop not found");
                        }

                        const listProduct = await ListProduct.findOne({
                            listId: shop.listId,
                            productId: productId,
                        });

                        if (!listProduct) {
                            throw new Error(
                                `Price list entry not found for product ${productId}`,
                            );
                        }

                        // Crear el detalle completo
                        const { INVE, AVER, LOTE, RECI, PEDI, VENT, RENT } =
                            productData;

                        const newDetail = {
                            product: productId,
                            cost: listProduct.cost,
                            salePrice: listProduct.salePrice,
                            INVE,
                            AVER,
                            LOTE,
                            RECI,
                            PEDI,
                            VENT,
                            PEDI_REAL: PEDI,
                            RENT,
                        };

                        order.orderDetails.push(newDetail);
                    }
                    await order.save();
                }
            }

            await this.bigOrderRepository.update(bigOrderId, {
                status: "Approved",
            });
        } catch (error) {
            throw new Error(`Error updating BigOrder: ${error.message}`);
        }
    }
}

module.exports = new UpdateBigOrder(
    new BigOrderRepository(),
    new OrderRepository(),
);
