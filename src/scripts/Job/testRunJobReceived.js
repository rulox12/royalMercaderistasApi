require("../../infrastructure/persistence/mongoose");
const { runJobReceived } = require("../../application/job/received/jobReceived");
require("../../infrastructure/persistence/models")
runJobReceived().then(() => {
    console.log("Job terminado");
    process.exit(0); // cerrar proceso cuando termine
});