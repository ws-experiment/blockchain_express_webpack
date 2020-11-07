const WebSocket = require("ws");

class WebSocketServer {
  constructor(server) {
    this.server = server;
    this.sockets = [];
  }

  //create the new Websocket Server
  listen() {
    const wss = new WebSocket.Server({ server: this.server });

    //to connect to the peers we have specified
    console.log(`listening web socket`);

    wss.on("connection", (socket) => {
      this.connectIncomingSocket(socket);
    });
  }

  //after receiving incoming connection from client socket
  connectIncomingSocket(incomingSocket) {
    this.sockets.push(incomingSocket);
    console.log(`connected to incoming socket`);

    this.closeConnectionHandler(incomingSocket);
  }

  closeConnectionHandler(closedSocket) {
    closedSocket.on("close", () => {
      console.log("socket is closed");
      closedSocket.isAlive = false;
      this.sockets = this.sockets.filter(socket => socket!= closedSocket);
    });
  }

  //send signal to browser in order to fetch data.
  broadcastSignal(){
    this.sockets.forEach(socket => {
      socket.send(JSON.stringify("SIGNAL"));
    })
  }
}

module.exports = WebSocketServer;
