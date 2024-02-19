const express = require('express');
const router = express.Router();
const bigOrderController = require('../controllers/bigOrderController');

router.post('/', bigOrderController.createBigOrder);
router.put('/', bigOrderController.updateBigOrder);
router.get('/', bigOrderController.getBigOrders);
router.get('/by-data-and-city', bigOrderController.getBigOrderByDateAndShop);
router.get('/:id', bigOrderController.getBigOrder);

module.exports = router;
