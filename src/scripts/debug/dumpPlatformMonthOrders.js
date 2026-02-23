const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

require('../../infrastructure/persistence/mongoose');
require('../../infrastructure/persistence/models');

const OrderRepository = require('../../infrastructure/persistence/repositories/OrderRepository');

async function dump(platformId, month, year, limit = 5) {
    try {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59, 999);

        const repo = new OrderRepository();
        const orders = await repo.getOrdersByPlatformAndDateRange(platformId, [{ start, end }]);

        console.log(`Found ${orders.length} orders for platform ${platformId} in ${year}-${String(month).padStart(2,'0')}`);

        const sample = orders.slice(0, limit);
        for (const o of sample) {
            console.log('--- ORDER ---');
            console.log('id:', o._id.toString());
            console.log('date:', o.date);
            console.log('shop:', o.shop?.toString());
            console.log('city:', o.cityId?.name || o.cityId);
            console.log('status:', o.status);
            console.log('orderDetails:');
            for (const d of o.orderDetails) {
                console.log(JSON.stringify({
                    product: d.product?._id || d.product,
                    INVE: d.INVE,
                    AVER: d.AVER,
                    RECI: d.RECI,
                    PEDI: d.PEDI,
                    VENT: d.VENT,
                    salePrice: d.salePrice,
                    cost: d.cost,
                    RENT: d.RENT
                }, null, 2));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error dumping orders:', err);
        process.exit(1);
    }
}

const [,, platformId, monthArg, yearArg, limitArg] = process.argv;
if (!platformId || !monthArg || !yearArg) {
    console.error('Usage: node dumpPlatformMonthOrders.js <platformId> <month> <year> [limit]');
    console.error('Example: node dumpPlatformMonthOrders.js 605c... 1 2026 3');
    process.exit(1);
}

dump(platformId, parseInt(monthArg,10), parseInt(yearArg,10), parseInt(limitArg||5,10));
