const express = require('express');
const { checkPayment } = require('../controllers/PaymentController');
const router = express.Router();

router.post('/check-payment', checkPayment);

module.exports = router;