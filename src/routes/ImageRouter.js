const express = require('express');
const uploadImage = require('../middleware/uploadImage');
const { upload } = require('../controllers/ImageController');

const router = express.Router();

router.post('/upload', uploadImage.single('image'), upload);

module.exports = router;