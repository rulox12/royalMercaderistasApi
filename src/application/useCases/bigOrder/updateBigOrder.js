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

                    // Normalizar productData: el frontend a veces envía un valor primitivo (ej. 1)
                    // en lugar de un objeto con campos. Convertimos a objeto para mantener
                    // la compatibilidad con el resto del flujo.
                    const pdata = (productData && typeof productData === 'object') ? productData : { PEDI: productData };

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
                        orderDetail.PEDI_REAL = pdata.PEDI;
                        console.log(`UpdateBigOrder: setting PEDI_REAL for order ${order._id} detail ${orderDetail._id || orderDetail.product} ->`, pdata.PEDI);
                        if (pdata.PEDI === undefined) {
                            console.warn('UpdateBigOrder: normalized productData has no PEDI for key', key, 'pdata ->', pdata, 'original ->', productData);
                        }
                        if (typeof order.markModified === 'function') {
                            order.markModified('orderDetails');
                        }
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
                        const { INVE, AVER, LOTE, RECI, PEDI, VENT, RENT } = pdata;

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

                        console.log(`UpdateBigOrder: pushing new detail into order ${order._id} ->`, newDetail);
                        order.orderDetails.push(newDetail);
                        if (typeof order.markModified === 'function') {
                            order.markModified('orderDetails');
                        }
                    }
                    try {
                        const saved = await order.save();
                        console.log(`UpdateBigOrder: order ${order._id} saved`, saved._id || saved);
                    } catch (err) {
                        console.error(`UpdateBigOrder: error saving order ${order._id}:`, err);
                        throw err;
                    }
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
