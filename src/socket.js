import io from 'socket.io-client';
import { LOCAL_ID } from 'constants';

const MAX_TIMEOUT = 2000; //480000;

export default function (socketUrl, customData, path) {
  const defaultOptions = { timeout: MAX_TIMEOUT, requestTimeout: MAX_TIMEOUT };
  const options = path ? { path, ...defaultOptions } : defaultOptions;
  const socket = io(socketUrl, options);

  socket.heartbeatTimeout = MAX_TIMEOUT;

  socket.on('connect', () => {
    console.log(`connect:${socket.id}`);
    socket.customData = customData;
  });

  socket.on('connect_error', (error) => {    
    localStorage.setItem("LOCAL_ID", JSON.stringify(LOCAL_ID));
    console.log("CONNETION ERROR!", error);
  });

  socket.on('error', (error) => {
    localStorage.setItem("LOCAL_ID", JSON.stringify(LOCAL_ID));
    console.log("ERROR!", error);
  });

  socket.on('disconnect', (reason) => {
    localStorage.setItem("LOCAL_ID", JSON.stringify(LOCAL_ID));
    console.log("DISCONNECTED!", reason);
  });

  return socket;
};
