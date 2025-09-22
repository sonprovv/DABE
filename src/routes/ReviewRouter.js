const express = require('express');
const router = express.Router();
const { createReview, getExperienceOfWorker } = require('../controllers/ReviewController');

router.post('/create', createReview);

router.get('/worker/:workerID/experience', getExperienceOfWorker);


module.exports = router;