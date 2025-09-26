const express = require('express');
const { getScheduleOfWorker } = require('../controllers/ScheduleController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const router = express.Router();

router.get('', verifyToken, checkPermission(['worker']), getScheduleOfWorker);

module.exports = router;