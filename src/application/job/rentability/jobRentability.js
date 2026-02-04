// jobRentability.js
const UpdateRentabilityUseCase = require("../../../application/useCases/order/UpdateRentabilityUseCase");
const ShopRepository = require("../../../infrastructure/persistence/repositories/ShopRepository");

async function runJobRentability() {
    console.log("📊 Starting rentability job...");

    const now = new Date();
    now.setDate(now.getDate() - 2); // Previous day
    const dateStr = now.toISOString().split("T")[0];

    try {
        const shopRepository = new ShopRepository();
        const shops = await shopRepository.getAll();

        for (const shop of shops) {
            try {
                console.log(`🔄 Calculating rentability for shop ${shop._id} on date ${dateStr}`);
                await UpdateRentabilityUseCase.execute(shop._id, dateStr);
                console.log(`✅ Rentability calculated for shop ${shop._id}`);
            } catch (err) {
                console.warn(`⚠️ Error in shop ${shop._id}: ${err.message}`);
            }
        }

        console.log("🎉 Rentability job completed.");
    } catch (err) {
        console.error("🔥 General error in rentability job:", err.message);
    }
}

module.exports = { runJobRentability };