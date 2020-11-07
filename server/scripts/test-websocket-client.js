const WebSocket = require("ws");

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const HOST = `ws://localhost:${HTTP_PORT}`;

let ws = new WebSocket(HOST);

ws.on("message", (incomingMessage) => {
  console.log(incomingMessage);
});
