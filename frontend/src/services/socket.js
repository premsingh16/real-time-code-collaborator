import { io } from 'socket.io-client';

export const initSocket = async () => {
 
  const backendUrl = import.meta.env.VITE_BACKEND_URL 
    ? import.meta.env.VITE_BACKEND_URL.replace('/api', '') 
    : 'http://localhost:3000';

  const options = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
  };

  return io(backendUrl, options);
};