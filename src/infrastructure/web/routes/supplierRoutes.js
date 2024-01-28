const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.get('/', supplierController.getSuppliers);
router.get('/:supplierId', supplierController.getSupplier);
router.post('/', supplierController.createSupplier);
router.delete('/', supplierController.deleteSupplier);
router.put('/:supplierId', supplierController.updateSupplier);

module.exports = router;