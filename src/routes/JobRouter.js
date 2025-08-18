const express = require('express');
const router = express.Router();

const { createJob, getJobsByServiceType } = require("../controllers/JobController");

router.post('/:serviceType', createJob);

router.get('/:serviceType', getJobsByServiceType);

module.exports = router;