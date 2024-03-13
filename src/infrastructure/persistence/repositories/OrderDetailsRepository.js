const OrderDetailsModel = require("../models/OrderDetailsModel");

class OrderDetailsRepository {
    async createMany(orderDetails) {
        try {
            const createdOrderDetails = await OrderDetailsModel.insertMany(orderDetails);
            return createdOrderDetails;
        } catch (error) {
            throw new Error(`Error while creating order details: ${error.message}`);
        }
    }

    async findByOrderId(order) {
        try {
            const orderDetails = await OrderDetailsModel.find({ order });
            return orderDetails;
        } catch (error) {
            throw new Error(`Error while fetching order details: ${error.message}`);
        }
    }

    async findByOrderIdAndProductId(orderId, productId) {
        try {
            const orderDetail = await OrderDetailsModel.findOne({ order: orderId, product: productId });
            return orderDetail;
        } catch (error) {
            throw new Error(`Error while fetching order detail by orderId and productId: ${error.message}`);
        }
    }

    async update(orderDetailId, updatedFields) {
        try {
            const updatedOrderDetail = await OrderDetailsModel.findByIdAndUpdate(
                orderDetailId,
                { $set: updatedFields },
                { new: true }
            );
            return updatedOrderDetail;
        } catch (error) {
            throw new Error(`Error while updating order detail: ${error.message}`);
        }
    }

    async create(orderDetail) {
        try {
            console.log(orderDetail);
            const createdOrderDetail = await OrderDetailsModel.create(orderDetail);
            return createdOrderDetail;
        } catch (error) {
            throw new Error(`Error while creating order detail: ${error.message}`);
        }
    }
}

module.exports = OrderDetailsRepository;
