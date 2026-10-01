const crypto = require('crypto');
const { roomStateMap } = require('../services/socketService');

const createRoom = (req, res, next) => {
  try {
    const { language, initialCode } = req.body || {};

    const roomId = crypto.randomUUID();

    roomStateMap.set(roomId, {
      code: initialCode || '// Start collaborating here...\n',
      language: language || 'cpp',
      users: new Map(),
    });

    res.status(201).json({
      success: true,
      message: 'Collaboration room created successfully',
      roomId,
    });
  } catch (error) {
    next(error);
  }
};

const getRoomInfo = (req, res, next) => {
  try {
    const { roomId } = req.params;
    const room = roomStateMap.get(roomId);

    if (!room) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'Room is currently empty or not yet initialized in memory',
        roomId,
        clients: [],
      });
    }

    const clients = Array.from(room.users.entries()).map(([socketId, username]) => ({
      socketId,
      username,
    }));

    res.status(200).json({
      success: true,
      exists: true,
      roomId,
      language: room.language,
      clients,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRoomInfo,
};