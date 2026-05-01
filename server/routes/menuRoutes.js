const express = require('express');
const router = express.Router();
const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem, getPublicMenu } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists at server root
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.get('/', getMenu);
router.get('/public/:tableId', getPublicMenu);
router.post('/', protect, authorize('Admin'), upload.single('image'), createMenuItem);
router.put('/:id', protect, authorize('Admin'), upload.single('image'), updateMenuItem);
router.delete('/:id', protect, authorize('Admin'), deleteMenuItem);

module.exports = router;