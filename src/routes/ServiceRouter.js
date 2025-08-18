const express = require('express');
const router = express.Router();
const { getByServiceTye } = require('../controllers/ServiceController');

router.get('/:serviceType', getByServiceTye);

module.exports = router;