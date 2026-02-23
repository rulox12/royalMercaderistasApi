const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

require('../../infrastructure/persistence/mongoose');
require('../../infrastructure/persistence/models');
const ShopRepository = require('../../infrastructure/persistence/repositories/ShopRepository');
const CalculateSalesUseCase = require('../../application/useCases/order/CalculateSalesUseCase');

/**
 * Calculate sales for a date range and all shops
 * Usage: node calculateSalesRange.js "2026-01-01" "2026-02-19"
 */

async function calculateSalesRange(startDate, endDate) {
    try {
        // Validate date format
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Fechas inválidas. Usar formato YYYY-MM-DD');
        }

        if (start > end) {
            throw new Error('Fecha inicio debe ser menor o igual a fecha fin');
        }

        console.log(`📈 Iniciando cálculo de VENTAS`);
        console.log(`📅 Rango: ${startDate} → ${endDate}`);

        const shopRepository = new ShopRepository();
        const shops = await shopRepository.getAll();
        console.log(`🏪 Tiendas a procesar: ${shops.length}`);

        let currentDate = new Date(start);
        let success = 0, errors = 0;

        // Iterate over each day in range
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            console.log(`\n🗓️  Procesando ${dateStr}...`);

            // Calculate sales for each shop
            for (const shop of shops) {
                try {
                    await CalculateSalesUseCase.execute(shop._id, dateStr);
                    console.log(`  ✅ Ventas calculadas para tienda ${shop._id}`);
                    success++;
                } catch (err) {
                    console.warn(`  ⚠️ Error en tienda ${shop._id}: ${err.message}`);
                    errors++;
                }
            }

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`\n🎉 Cálculo de ventas completado: ${success} éxitos, ${errors} errores`);
        process.exit(0);
    } catch (err) {
        console.error(`🔥 Error fatal:`, err.message);
        process.exit(1);
    }
}

const startDate = process.argv[2];
const endDate = process.argv[3];

if (!startDate || !endDate) {
    console.error('❌ Uso: node calculateSalesRange.js "YYYY-MM-DD" "YYYY-MM-DD"');
    console.error('Ejemplo: node calculateSalesRange.js "2026-01-01" "2026-02-19"');
    process.exit(1);
}

calculateSalesRange(startDate, endDate);
