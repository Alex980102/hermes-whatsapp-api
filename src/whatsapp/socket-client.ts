import { Manager, Socket } from 'socket.io-client';

export const connectToServer = () => {
  // http://localhost:3000/socket.io/socket.io.js

  const manager = new Manager('http://localhost:3000/socket.io/socket.io.js');

  const socket = manager.socket('/');

  addListeners(socket);
};

const addListeners = (socket: Socket) => {
  socket.on('connect', () => {
    console.log('Connect');
  });

  socket.on('disconnect', () => {
    console.log('Disconect');
  });
};
