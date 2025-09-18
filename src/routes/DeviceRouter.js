const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { postFcmToken } = require('../controllers/DeviceController');

router.post('', verifyToken, postFcmToken);

module.exports = router;