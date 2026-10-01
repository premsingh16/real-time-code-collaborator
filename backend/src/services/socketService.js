const roomStateMap = new Map();

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, username }) => {
      if (!roomId || !username) return;

      socket.join(roomId);

      if (!roomStateMap.has(roomId)) {
        roomStateMap.set(roomId, {
          code: '// Start collaborating here...\n',
          language: 'cpp',
          users: new Map(),
        });
      }

      const room = roomStateMap.get(roomId);
      room.users.set(socket.id, username);

      const clientsList = Array.from(room.users.entries()).map(
        ([id, name]) => ({
          socketId: id,
          username: name,
        })
      );

      socket.emit('sync-room-state', {
        code: room.code,
        language: room.language,
        clients: clientsList,
      });

      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        username,
        clients: clientsList,
      });
    });

    socket.on('code-change', ({ roomId, code }) => {
      if (roomStateMap.has(roomId)) {
        roomStateMap.get(roomId).code = code;
      }
      socket.to(roomId).emit('code-update', { code });
    });

    socket.on('language-change', ({ roomId, language }) => {
      if (roomStateMap.has(roomId)) {
        roomStateMap.get(roomId).language = language;
      }
      socket.to(roomId).emit('language-update', { language });
    });

    socket.on('output-change', ({ roomId, outputData }) => {
      socket.to(roomId).emit('output-update', { outputData });
    });

    socket.on('disconnecting', () => {
      const rooms = [...socket.rooms];

      rooms.forEach((roomId) => {
        if (roomStateMap.has(roomId)) {
          const room = roomStateMap.get(roomId);
          const leavingUsername = room.users.get(socket.id);

          room.users.delete(socket.id);

          const updatedClients = Array.from(room.users.entries()).map(
            ([id, name]) => ({
              socketId: id,
              username: name,
            })
          );

          socket.to(roomId).emit('user-left', {
            socketId: socket.id,
            username: leavingUsername,
            clients: updatedClients,
          });

          if (room.users.size === 0) {
            roomStateMap.delete(roomId);
          }
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket, roomStateMap };