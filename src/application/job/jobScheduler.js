const cron = require("node-cron");
const { runJobSales } = require("./sale/jobSales");
const { runJobReceived } = require("./received/jobReceived");
const { runJobRentability } = require("./rentability/jobRentability");

function scheduleAllJobs() {
    cron.schedule("0 4 * * *", runJobSales);        // 🕓 04:00 - Ventas
    cron.schedule("30 4 * * *", runJobReceived);    // 🕟 04:30 - Recibidos
    cron.schedule("50 4 * * *", runJobRentability); // 🕣 04:50 - Rentabilidad (último)

}

module.exports = scheduleAllJobs;