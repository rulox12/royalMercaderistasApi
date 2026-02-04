require("../../infrastructure/persistence/mongoose");
const { runJobSales } = require("../../application/job/sale/jobSales");
require("../../infrastructure/persistence/models")

runJobSales().then(() => {
    console.log("✅ Test de sales finalizado");
}).catch(err => {
    console.error("🔥 Error en test de sales:", err);
});