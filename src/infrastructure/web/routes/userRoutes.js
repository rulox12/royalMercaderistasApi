const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.createUser);
router.delete("/", userController.deleteUser);
router.get("/:userId", userController.getUser);
router.put("/:userId", userController.updateUser);
router.get("/", userController.getUsers);

module.exports = router;
