const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByJobID, getOrdersByWorkerID, putByUID } = require('../controllers/OrderController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

router.post('/create', verifyToken, checkPermission(['worker']), createOrder);

router.get('/job/:jobID', verifyToken, checkPermission(['user']), getOrdersByJobID);

router.get('/worker/:workerID', verifyToken, checkPermission(['worker']), getOrdersByWorkerID);

router.put('/update', verifyToken, checkPermission(['user']), putByUID);

module.exports = router;