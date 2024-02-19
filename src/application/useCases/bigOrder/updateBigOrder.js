const BigOrder = require("../../../domain/models/BigOrder");
const BigOrderRepository = require("../../../infrastructure/persistence/repositories/BigOrderRepository");
const OrderRepository = require("../../../infrastructure/persistence/repositories/OrderRepository");
const Order = require("../../../domain/models/Order");
const OrderDetailsRepository = require("../../../infrastructure/persistence/repositories/OrderDetailsRepository");

class UpdateBigOrder {
  constructor(bigOrderRepository, orderRepository, orderDetailRepository) {
    this.bigOrderRepository = bigOrderRepository
    this.orderRepository = orderRepository
    this.orderDetailRepository = orderDetailRepository
  }

  async execute(bigOrder, products, userId) {
    for (const key in products) {
      if (Object.hasOwnProperty.call(products, key)) {
        const [productId, shopId] = key.split('_');
        const quantity = products[key];
        const order = await this.orderRepository.get({ date: bigOrder.date, shop: shopId });
        let orderId;
        if (order) {
          orderId = order.id;
          await this.orderRepository.update(orderId, { status: "APPROVED" });
        } else {
          const newOrder = new Order(null, bigOrder.date, shopId, 'APPROVED', userId, bigOrder.cityId);
          const order = await this.orderRepository.create(newOrder);
          orderId = order.id;
        }

        const orderDetail = await this.orderDetailRepository.findByOrderIdAndProductId(orderId, productId);

        if (orderDetail) {
          const query = { PEDI_REAL: quantity };
          await this.orderDetailRepository.update(orderDetail.id, query)
        } else {
          const query = {
            product: productId,
            PEDI_REAL: quantity,
            order: orderId,
          };
          await this.orderDetailRepository.create(query);
        }
      }
    }
  }
}

module.exports = new UpdateBigOrder(new BigOrderRepository(), new OrderRepository(), new OrderDetailsRepository());
