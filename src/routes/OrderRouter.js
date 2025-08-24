const express = require('express');
const router = express.Router();
const { createOrder, getOrdersByJobID, getOrdersByWorkerID, putByUID } = require('../controllers/OrderController');

router.post('/create', createOrder);

router.get('/job/:jobID', getOrdersByJobID);

router.get('/worker/:workerID', getOrdersByWorkerID);

router.put('/update', putByUID);

module.exports = router;