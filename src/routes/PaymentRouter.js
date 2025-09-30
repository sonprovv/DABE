const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { checkPayment, getPayments } = require('../controllers/PaymentController');

const router = express.Router();

router.post('/check-payment', checkPayment);

// router.get('', verifyToken, checkPermission(['admin']), getPayments)
router.get('', getPayments)

module.exports = router;