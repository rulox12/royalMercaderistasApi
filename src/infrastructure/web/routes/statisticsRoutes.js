const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

router.get("/home", statisticsController.getHome);
router.post("/full-process", statisticsController.runFullProcess);
router.get("/sales-calculation-logs", statisticsController.getSalesCalculationLogs);

module.exports = router;
