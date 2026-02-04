require("../../infrastructure/persistence/mongoose");
const { runJobRentability } = require("../../application/job/rentability/jobRentability");
require("../../infrastructure/persistence/models")
runJobRentability().then(() => {
    console.log("✅ Test de rentabilidad finalizado");
}).catch(err => {
    console.error("🔥 Error en test de rentabilidad:", err);
});