const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  },
});

const uploadImage = multer({ storage: storage });

module.exports = uploadImage;