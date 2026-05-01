const express = require('express');
const router = express.Router();
const { generateBill, getBill, updatePaymentStatus, getAllBills } = require('../controllers/billController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Waiter'), getAllBills);
router.post('/generate/:orderId', protect, authorize('Admin', 'Waiter'), generateBill);
router.get('/:id', protect, getBill);
router.put('/:id/payment', protect, authorize('Admin', 'Waiter'), updatePaymentStatus);

module.exports = router;
