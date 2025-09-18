const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { postFcmToken, deleteFcmToken } = require('../controllers/DeviceController');

router.post('', verifyToken, postFcmToken);

router.put('/logout', verifyToken, deleteFcmToken)

module.exports = router;