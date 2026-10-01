const express = require('express');
const router = express.Router();

const {
  createRoom,
  getRoomInfo,
} = require('../controllers/roomController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create', protect, createRoom);
router.get('/:roomId', protect, getRoomInfo);

module.exports = router;