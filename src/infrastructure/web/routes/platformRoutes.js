const express = require("express");
const router = express.Router();
const platformController = require("../controllers/platformController");

router.post("/", platformController.createPlatform);
router.get("/:platformId", platformController.getPlatform);
router.put("/:platformId", platformController.updatePlatform);
router.get("/", platformController.getPlatforms);

module.exports = router;