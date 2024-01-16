const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

router.post('/', cityController.createCity);
router.get('/:cityId', cityController.getCity);
router.get('/', cityController.getCities);

module.exports = router;
