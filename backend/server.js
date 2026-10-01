require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/services/socketService');

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

initSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});