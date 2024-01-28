const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.post('/', shopController.createShop); 
router.delete('/', shopController.deleteShop); 
router.put('/:shopId', shopController.updateShop); 
router.get('/:shopId', shopController.getShop);
router.get('/', shopController.getShops);

module.exports = router;
