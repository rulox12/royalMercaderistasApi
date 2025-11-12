const cron = require("node-cron");
const { runJobReceived } = require("./jobReceived");

function scheduleJobReceived() {
    cron.schedule("0 4 * * *", runJobReceived);
}

module.exports = scheduleJobReceived;