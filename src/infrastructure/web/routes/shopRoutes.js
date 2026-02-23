const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const shopDashboardController = require('../controllers/getDashboardShopController');

router.post('/', shopController.createShop); 
router.delete('/', shopController.deleteShop); 
router.put('/:shopId', shopController.updateShop); 
router.get('/dashboard/compare', shopDashboardController.getDashboard);
router.get('/:shopId', shopController.getShop);
router.get('/', shopController.getShops);

module.exports = router;
