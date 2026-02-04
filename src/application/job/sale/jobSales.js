// jobSales.js
const CalculateSalesUseCase = require("../../useCases/order/CalculateSalesUseCase");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

async function runJobSales() {
    console.log("⏳ Iniciando cálculo automático de ventas...");

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const dateStr = yesterday.toISOString().split("T")[0];

    try {
        const shopRepository = new ShopRepository();
        const shops = await shopRepository.getAll();

        for (const shop of shops) {
            try {
                console.log(`📦 Calculando ventas para tienda ${shop._id} en fecha ${dateStr}`);
                await CalculateSalesUseCase.execute(shop._id, dateStr);
                console.log(`✅ Ventas calculadas para tienda ${shop._id}`);
            } catch (err) {
                console.warn(`⚠️ Error en tienda ${shop._id}: ${err.message}`);
            }
        }

        console.log("🎉 Cálculo automático de ventas completado.");
    } catch (err) {
        console.error("🔥 Error general en el job de ventas:", err.message);
    }
}

module.exports = { runJobSales };