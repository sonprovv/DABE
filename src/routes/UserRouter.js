const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { profile, createUser, forgotPassword, changePassword, updateUser, deleteUser} = require('../controllers/UserController');

const router = express.Router();

router.get('/me', verifyToken, profile);

router.post('/create', verifyToken, createUser);

router.put('/forgot-password', forgotPassword);

router.put('/change-password', verifyToken, checkPermission(['worker', 'viewer']), changePassword);

router.put('/update', verifyToken, checkPermission(['worker', 'viewer']), updateUser);

router.delete('/delete', verifyToken, checkPermission(['admin']), deleteUser);

module.exports = router;