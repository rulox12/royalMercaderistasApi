const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.delete('/', roleController.deleteRole);
router.post('/create', roleController.createRole);
router.get('/:roleId', roleController.getRole);
router.get('/', roleController.getRoles);

module.exports = router;
