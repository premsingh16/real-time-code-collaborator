const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
  compileCode,
  saveCode,
  getUserCodes,
  getCodeById,
  deleteCode,
} = require('../controllers/codeController');
const { protect } = require('../middlewares/authMiddleware');

const compileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many code executions. Please wait a moment before compiling again.',
  },
});

router.post('/compile', compileLimiter, protect, compileCode);

router.post('/save', protect, saveCode);
router.get('/my-codes', protect, getUserCodes);
router.get('/:id', protect, getCodeById);
router.delete('/:id', protect, deleteCode);

module.exports = router;