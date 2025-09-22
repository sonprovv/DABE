const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { getByClientID, putClientReaded } = require('../controllers/NotificationController');
const router = express.Router();

router.get('', verifyToken, getByClientID);

router.put('/:notificationID', verifyToken, putClientReaded);

module.exports = router;