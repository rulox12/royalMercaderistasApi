const express = require('express');
const router = express.Router();
const bigOrderController = require('../controllers/bigOrderController');

router.post('/', bigOrderController.createBigOrder);
router.get('/', bigOrderController.getBigOrders);
router.get('/:id', bigOrderController.getBigOrder);

module.exports = router;
