const express = require('express');
const router = express.Router();
const { sendCode } = require('../controllers/EmailController');

router.post('/send', sendCode);

module.exports = router;