const express = require('express');
const router = express.Router();
const realSaleController = require('../controllers/realSaleController');

router.get('/form-data', realSaleController.getFormData);
router.post('/', realSaleController.createRealSale);
router.put('/:realSaleId', realSaleController.updateRealSale);

module.exports = router;