const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { forgotPassword, changePassword, updateUser, deleteUser } = require('../controllers/UserController');

router.put('/forgot-password', forgotPassword);

router.put('/change-password', verifyToken, changePassword);

router.put('/update', verifyToken, checkPermission(['user', 'worker']), updateUser);

// router.delete('/delete', verifyToken, checkPermission(['admin']), deleteUser);

module.exports = router;