const express = require('express');
const router = express.Router();

const { createJob, getByUID, getJobsByUserID, getJobsByServiceType } = require("../controllers/JobController");
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

router.post('/:serviceType', verifyToken, checkPermission(['user']), createJob);

router.get('/:serviceType/:jobID', getByUID);

router.get('/user/:userID', verifyToken, checkPermission(['user']), getJobsByUserID);

router.get('/type/:serviceType', getJobsByServiceType);

module.exports = router;