const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");

router.post("/export-generic", exportController.genericExport);

module.exports = router;
