const express = require('express');
const router = express.Router();

const { createJob, getJobsByServiceType, getJobsByUserID } = require("../controllers/JobController");

router.post('/:serviceType', createJob);

router.get('/:serviceType', getJobsByServiceType);

router.get('/user/:userID', getJobsByUserID);

module.exports = router;