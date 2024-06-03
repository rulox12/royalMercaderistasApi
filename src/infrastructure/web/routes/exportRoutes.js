const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");

router.post("/export-generic", exportController.genericExport);
router.post("/export-all-shops", exportController.allShopsExport);

module.exports = router;
