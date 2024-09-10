const mongoose = require('mongoose');
const OrderModel = require('../../infrastructure/persistence/models/OrderModel');
const ShopModel = require('../../infrastructure/persistence/models/ShopModel');
require("dotenv").config();

async function updateOrdersWithPlatform() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const orders = await OrderModel.find().populate('shop');

        for (const order of orders) {
            const shop = order.shop;

            if (shop && shop.platformId) {
                order.platform = shop.platformId;
                await order.save();
            }
        }

        console.log('Órdenes actualizadas con éxito.');
    } catch (error) {
        console.error('Error actualizando las órdenes:', error);
    } finally {
        await mongoose.connection.close();
    }
}

updateOrdersWithPlatform();