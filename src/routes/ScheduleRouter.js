const express = require('express');
const { getScheduleOfWorker } = require('../controllers/ScheduleController');
const router = express.Router();

router.get('/:workerID', getScheduleOfWorker);

module.exports = router;