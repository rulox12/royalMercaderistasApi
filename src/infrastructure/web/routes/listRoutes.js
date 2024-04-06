const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.post('/', listController.createList);
router.post('/products', listController.createListProducts);
router.get('/:listId', listController.getList);
router.delete("/", listController.deleteList);
router.get('/products/:listId/:populateProduct', listController.getListProducts);
router.get('/', listController.getLists);

module.exports = router;
