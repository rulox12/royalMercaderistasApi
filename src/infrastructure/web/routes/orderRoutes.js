const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/:orderId', orderController.getOrder);
router.get('/', orderController.getOrders);
router.post('/get-orders-by-dates-and-shop', orderController.getOrdersByDatesAndShop);
router.post('/get-orders-by-date', orderController.getOrdersByDate);
router.get("/not-received/:date", orderController.getNotReceivedOrders);
router.get("/not-received/shop/:shopId/from/:startDate/to/:endDate", orderController.getNotReceivedOrdersByShopAndRange);

module.exports = router;
