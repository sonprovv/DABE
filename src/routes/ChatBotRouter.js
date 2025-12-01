const express = require('express');
const router = express.Router();

const { search, clearSession, getSessionInfo } = require('../controllers/ChatBotController');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');

// Main chatbot endpoint
router.post('', verifyToken, checkPermission(['user', 'worker']), search);

// Session management endpoints
router.post('/session/clear', verifyToken, checkPermission(['user', 'worker']), clearSession);
router.post('/session/info', verifyToken, checkPermission(['user', 'worker']), getSessionInfo);

module.exports = router;