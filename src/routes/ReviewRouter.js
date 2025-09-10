const express = require('express');
const router = express.Router();
const { createReview, getExperienceOfWorker } = require('../controllers/ReviewController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

router.post('/create', verifyToken, checkPermission(['user']), createReview);

router.get('/worker/:workerID/experience', getExperienceOfWorker);


module.exports = router;