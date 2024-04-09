const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");

router.get("/home", statisticsController.getHome);

module.exports = router;
