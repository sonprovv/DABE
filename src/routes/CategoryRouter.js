const express = require('express');
const { verifyToken } = require('../middleware/verifyToken');
const { checkPermission } = require('../middleware/checkPermission');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/CategoryController');

const router = express.Router();

router.get('', verifyToken, getCategories);

router.post('/create', verifyToken, checkPermission(['admin']), createCategory);

router.put('/update', verifyToken, checkPermission(['admin']), updateCategory);

router.delete('/delete', verifyToken, checkPermission(['admin']), deleteCategory);

module.exports = router;