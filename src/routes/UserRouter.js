const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { loginWithGG, getMe, createUser, forgotPassword, changePassword, updateUser, deleteUser } = require('../controllers/UserController');

router.post('/google', loginWithGG);

router.post('/me', getMe);

router.post('/create', createUser);

router.put('/forgot-password', forgotPassword);

router.put('/change-password', verifyToken, changePassword);

router.put('/update', verifyToken, updateUser);

router.delete('/delete', verifyToken, checkPermission(['admin']), deleteUser);

module.exports = router;