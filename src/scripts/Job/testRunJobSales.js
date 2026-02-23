const path = require("path");
const dotenv = require("dotenv");
// Load .env from project root so scripts work regardless of current working directory.
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });
const uriArg = process.argv[2];
if (uriArg) {
    process.env.MONGODB_URI = uriArg;
}

if (!process.env.MONGODB_URI) {
    console.error("❌ Falta MONGODB_URI. Define la variable de entorno o pasa la URI como primer argumento.\nEjemplos:\n  MONGODB_URI=\"mongodb://<user>:<pass>@host:port/db\" node src/scripts/Job/testRunJobSales.js\n  node src/scripts/Job/testRunJobSales.js \"mongodb://<user>:<pass>@host:port/db\"");
    process.exit(1);
}

require("../../infrastructure/persistence/mongoose");
const { runJobSales } = require("../../application/job/sale/jobSales");
require("../../infrastructure/persistence/models");

runJobSales().then(() => {
        console.log("✅ Test de sales finalizado");
}).catch(err => {
        console.error("🔥 Error en test de sales:", err);
});