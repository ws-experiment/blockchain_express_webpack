const { data } = require("autoprefixer");
const PubNub = require("pubnub");
const WebSocketServer = require("../util/websocket-server");

const credentials = {
  publishKey: "pub-c-95d558ed-052d-40d5-b681-1c07114160d2",
  subscribeKey: "sub-c-57157ae2-e4fb-11ea-9395-f2758a71b136",
  secretKey: "sec-c-ZGVmOTNlMTAtMDgyNy00MDc1LTg0NWEtOTNiNDE4OTUxMzAw",
};

const CHANNELS = {
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
  SYNC_CHAIN_SIGNAL: "SYNC_CHAIN_SIGNAL",
  SYNC_CHAIN: "SYNC_CHAIN",
  TESTING_CHANNEL: "TESTING_CHANNEL",
};

class PubSub {
  //initialize the blockchain props
  constructor({
    blockchain,
    currentHttpPort,
    transactionPool,
    wallet,
    httpServer,
  }) {
    this.blockchain = blockchain;
    this.currentHttpPort = currentHttpPort;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubNub = new PubNub(credentials);
    //subscribe to available channels
    this.pubNub.subscribe({ channels: Object.values(CHANNELS) });
    //listen to message event that get fired within the overall network
    this.pubNub.addListener(this.listener());

    //#region WebSocketServer
    // //passing the http server into the web socket.
    this.webSocketServer = new WebSocketServer(httpServer);
    this.webSocketServer.listen();
    //#endregion WebSocketServer
  }

  listener = () => {
    return {
      message: (messageObject) => {
        const { channel, message } = messageObject;
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.senderPort === this.currentHttpPort) {
          console.log(`local port, ignoring message from ${channel}`);
          return;
        }

        console.log(
          `Message received: Channel: ${channel}. Message: ${message}`
        );

        switch (channel) {
          case CHANNELS.BLOCKCHAIN:
            //if the sender chain is validated, replace the chain with sender chain
            this.blockchain.replaceChain(parsedMessage.data, true, () => {
              //allow live update for transaction pool to the peer network
              this.webSocketServer.broadcastSignal();
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMessage.data,
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (parsedMessage.data.input.address !== this.wallet.publicKey) {
              this.webSocketServer.broadcastSignal();
              this.transactionPool.setTransaction(parsedMessage.data);
            } else {
              console.log(
                "TRANSACTION broadcast received from self, ignoring.."
              );
            }
            break;
          /**
           * When new node is initialized,
           * broadcast the chains and transactions across the network
           */
          case CHANNELS.SYNC_CHAIN_SIGNAL:
            this.broadcastData();
            break;
          /**
           * When received the signals, sync the local chain and transactions with broadcasted data
           */
          case CHANNELS.SYNC_CHAIN:
            //if the sender chain is validated, replace the chain with sender chain
            this.blockchain.replaceChain(parsedMessage.data.chain);
            const broadcastedTransactionMap = parsedMessage.data.transactionMap;
            console.log(
              `replacing transaction Pool Map on sync with ${broadcastedTransactionMap}`
            );
            this.transactionPool.setMap(broadcastedTransactionMap);
            break;
          default:
            return;
        }
      },
    };
  };

  publish = ({ channel, messageContent }) => {
    const sendMessage = {
      senderPort: this.currentHttpPort,
      data: messageContent,
    };

    setTimeout(
      () =>
        this.pubNub.publish(
          { channel, message: JSON.stringify(sendMessage) },
          (status, res) => {}
        ),
      1000
    );
  };

  //publish my blockchain to the channel
  broadcastChain = () => {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      messageContent: this.blockchain.chain,
    });
  };

  broadcastTransaction = (transaction) => {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      messageContent: transaction,
    });
  };

  broadcastData = () => {
    this.publish({
      channel: CHANNELS.SYNC_CHAIN,
      messageContent: {
        chain: this.blockchain.chain,
        transactionMap: this.transactionPool.transactionMap,
      },
    });
  };

  syncChainSignal = () => {
    this.publish({
      channel: CHANNELS.SYNC_CHAIN_SIGNAL,
      messageContent: null,
    });
  };
}

module.exports = PubSub;
