const express = require('express');
const router = express.Router();
const { getTables, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTables);
router.post('/', protect, authorize('Admin', 'Waiter'), createTable);
router.put('/:id', protect, authorize('Admin', 'Waiter'), updateTable);
router.delete('/:id', protect, authorize('Admin'), deleteTable);

module.exports = router;
