const express = require('express');
const { postFcmToken } = require('../controllers/DeviceController');
const router = express.Router();

router.post('/:clientID', postFcmToken);

module.exports = router;