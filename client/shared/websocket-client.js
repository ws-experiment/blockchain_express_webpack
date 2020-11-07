class WebSocketClient {
  constructor(hostAddress) {
    this.hostAddress = hostAddress;
    this.ws = null;
  }

  connect(passedMessage) {
    this.ws = new WebSocket(this.hostAddress);
    this.ws.onmessage = (event) => {
      console.log(JSON.parse(event.data));
      passedMessage();
    };
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default WebSocketClient;
