const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.delete('/', categoryController.deleteCategory);
router.put('/:categoryId', categoryController.updateCategory);
router.post('/:categoryId/products', categoryController.addProductToCategory);
router.delete('/products/:productId', categoryController.removeProductFromCategory);

module.exports = router;
