const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

require('../../infrastructure/persistence/mongoose');
require('../../infrastructure/persistence/models');

const OrderModel = require('../../infrastructure/persistence/models/OrderModel');
const ShopModel = require('../../infrastructure/persistence/models/ShopModel');
const ListProductModel = require('../../infrastructure/persistence/models/ListProductModel');

async function fillMissingPrices(startDate, endDate) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Fechas inválidas. Usar formato YYYY-MM-DD');
        }

        console.log(`📅 Rango de fechas: ${startDate} → ${endDate}`);

        console.log('🔧 Cargando ListProduct en memoria...');
        const listProducts = await ListProductModel.find({});
        // Map: "listId_productId" => { cost, salePrice }
        const priceMap = new Map();
        listProducts.forEach(lp => {
            const key = `${lp.listId}_${lp.productId}`;
            priceMap.set(key, { cost: lp.cost, salePrice: lp.salePrice });
        });
        console.log(`✅ ${listProducts.length} entradas de ListProduct cargadas`);

        console.log('🔧 Cargando shops en memoria...');
        const shops = await ShopModel.find({}).lean();
        const shopMap = new Map();
        shops.forEach(s => shopMap.set(s._id.toString(), s));
        console.log(`✅ ${shops.length} shops cargados`);

        console.log('🔧 Buscando TODAS las órdenes en el rango de fechas...');
        const orders = await OrderModel.find({
            date: { $gte: start, $lte: end }
        }).lean();

        console.log(`📊 Encontradas ${orders.length} órdenes en el rango`);

        let ordersUpdated = 0;
        let detailsUpdated = 0;
        let notFound = 0;
        const bulkOps = [];

        for (const order of orders) {
            const shop = shopMap.get(order.shop.toString());
            if (!shop) {
                console.warn(`⚠️ Shop ${order.shop} no encontrado para orden ${order._id}`);
                continue;
            }

            const listId = shop.listId.toString();
            
            // Actualizar TODOS los detalles de la orden
            for (const detail of order.orderDetails) {
                const key = `${listId}_${detail.product.toString()}`;
                const prices = priceMap.get(key);
                
                if (prices) {
                    detail.cost = prices.cost || '0';
                    detail.salePrice = prices.salePrice || '0';
                    detailsUpdated++;
                } else {
                    notFound++;
                }
            }

            // Actualizar orden siempre (no verificar si modificó)
            bulkOps.push({
                updateOne: {
                    filter: { _id: order._id },
                    update: { $set: { orderDetails: order.orderDetails } }
                }
            });
            ordersUpdated++;

            // Process in batches of 500
            if (bulkOps.length >= 500) {
                await OrderModel.bulkWrite(bulkOps);
                console.log(`✅ Procesadas ${ordersUpdated} órdenes...`);
                bulkOps.length = 0;
            }
        }

        // Process remaining
        if (bulkOps.length > 0) {
            await OrderModel.bulkWrite(bulkOps);
        }

        console.log(`\n🎉 Migración completada:`);
        console.log(`   ${ordersUpdated} órdenes actualizadas`);
        console.log(`   ${detailsUpdated} detalles actualizados`);
        console.log(`   ${notFound} productos sin precio en ListProduct`);
        process.exit(0);
    } catch (err) {
        console.error('🔥 Error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

const [,, startDate, endDate] = process.argv;

if (!startDate || !endDate) {
    console.error('❌ Uso: node fillMissingPrices.js "YYYY-MM-DD" "YYYY-MM-DD"');
    console.error('Ejemplo: node fillMissingPrices.js "2026-01-01" "2026-01-31"');
    process.exit(1);
}

fillMissingPrices(startDate, endDate);
