const OrderModel = require("../models/OrderModel");

class OrderRepository {
    async create(order) {
        const newOrder = new OrderModel(order);
        await newOrder.save();
        return newOrder;
    }

    async findById(orderId) {
        return OrderModel.findById(orderId).populate('orderDetails.product').exec();
    }

    async getAll(filters, page = 1, limit = 30, shopId = '') {
        try {
            const skip = (page - 1) * limit;

            let query = filters;

            if (shopId) {
                query.shop = shopId;
            }

            const orders = await OrderModel.find(query)
                .sort({date: -1, _id: 1})
                .skip(skip)
                .limit(limit)
                .populate('cityId')
                .populate('shop')
                .populate('user')
                .populate('orderDetails.product');

            const totalOrders = await OrderModel.countDocuments(filters);
            return {
                orders,
                totalOrders,
                totalPages: Math.ceil(totalOrders / limit),
                currentPage: page,
            };
        } catch (error) {
            throw new Error(`Error while fetching orders: ${error.message}`);
        }
    }

    async getOrderByDateAndShop(date, shop) {
        return OrderModel.findOne({date, shop}).populate('orderDetails.product').exec();
    }

    async getOrdersByDate(date) {
        try {
            const orders = await OrderModel.find({date});
            return orders;
        } catch (error) {
            throw new Error(`Error while fetching orders: ${error.message}`);
        }
    }

    async getOrdersByUser(userId) {
        try {
            const orders = await OrderModel.find({date}).populate('orderDetails.product');
            return orders;
        } catch (error) {
            throw new Error(`Error while fetching orders: ${error.message}`);
        }
    }

    async get(filters) {
        try {
            const orders = await OrderModel.findOne(filters).populate('orderDetails.product');
            ;
            return orders;
        } catch (error) {
            throw new Error(`Error while fetching orders: ${error.message}`);
        }
    }

    async update(orderId, updatedFields) {
        try {
            const updatedOrder = await OrderModel.findByIdAndUpdate(
                orderId,
                updatedFields,
                {new: true}
            ).populate('orderDetails.product').exec();

            return updatedOrder;
        } catch (error) {
            throw new Error(`Error while updating order: ${error.message}`);
        }
    }

    async save(order) {
        try {
            const updatedOrder = await order.save();
            return updatedOrder;
        } catch (error) {
            throw new Error(`Error while saving order: ${error.message}`);
        }
    }

    async updateMany(filter, updateData) {
        return OrderModel.updateMany(filter, { $set: updateData });
    }

    async getReceivedShopsByDate(date) {
        const formattedDate = new Date(date);

        const receivedShops = await OrderModel.aggregate([
            { $match: { date: formattedDate } },
            { $group: { _id: "$shop" } },
        ]);

        return receivedShops.map(shop => shop._id.toString());
    }

    async getReceivedShopsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const receivedShops = await OrderModel.aggregate([
            {
                $match: {
                    date: {
                        $gte: start,
                        $lte: end
                    }
                }
            },
            {
                $group: {
                    _id: "$shop"
                }
            }
        ]);

        return receivedShops.map(shop => shop._id.toString());
    }
}

module.exports = OrderRepository;