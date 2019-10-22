// import io from 'socket.io-client';

// const MAX_TIMEOUT = 480000;

// export default function (socketUrl, customData, path) {
//   const defaultOptions = { timeout: MAX_TIMEOUT };
//   const options = path ? { path, ...defaultOptions } : defaultOptions;
//   const socket = io(socketUrl, options);

//   socket.requestTimeout = MAX_TIMEOUT;

//   socket.on('connect', () => {
//     console.log(`connect:${socket.id}`);
//     socket.customData = customData;
//   });

//   socket.on('connect_error', (error) => {
//     console.log(error);
//   });

//   socket.on('error', (error) => {
//     console.log(error);
//   });

//   socket.on('disconnect', (reason) => {
//     console.log(reason);
//   });

//   return socket;
// };
