const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { askQuestion } = require('../controllers/AIController');

// Endpoint để hỏi câu hỏi đến RAG system
router.post('/ask', verifyToken, askQuestion);

module.exports = router;