const express = require('express');
const router = express.Router();
const { loginWithGG, getMe, createClient, refreshIdToken } = require('../controllers/AuthController');

router.post('/me', getMe);

router.post('/loginGG', loginWithGG);

router.post('/create', createClient);

router.post('/client/refreshToken', refreshIdToken);

module.exports = router;