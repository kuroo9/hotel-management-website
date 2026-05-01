const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus, getOrderById } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, authorize('Admin', 'Waiter'), createOrder);
router.put('/:id/status', protect, authorize('Admin', 'Chef', 'Waiter'), updateOrderStatus);

module.exports = router;
