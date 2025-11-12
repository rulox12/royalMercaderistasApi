// jobReceived.js
const UpdateReceivedUseCase = require("../../../application/useCases/order/UpdateReceivedUseCase");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

async function runJobReceived() {
    console.log("📦 Iniciando job de actualización de RECI...");

    const now = new Date();
    now.setDate(now.getDate() - 1); // Día anterior en hora Colombia
    const dateStr = now.toISOString().split("T")[0];
    console.log(dateStr);
    try {
        const shopRepository = new ShopRepository();
        const shops = await shopRepository.getAll();
        for (const shop of shops) {
            try {
                console.log(`🔄 Actualizando RECI para tienda ${shop._id} en fecha ${dateStr}`);
                await UpdateReceivedUseCase.execute(shop._id, dateStr);
                console.log(`✅ RECI actualizado para tienda ${shop._id}`);
            } catch (err) {
                console.warn(`⚠️ Error en tienda ${shop._id}: ${err.message}`);
            }
        }

        console.log("🎉 Job de RECI completado.");
    } catch (err) {
        console.error("🔥 Error general en el job de RECI:", err.message);
    }
}

module.exports = { runJobReceived };