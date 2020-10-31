const PubNub = require("pubnub");

const credentials = {
  publishKey: "pub-c-95d558ed-052d-40d5-b681-1c07114160d2",
  subscribeKey: "sub-c-57157ae2-e4fb-11ea-9395-f2758a71b136",
  secretKey: "sec-c-ZGVmOTNlMTAtMDgyNy00MDc1LTg0NWEtOTNiNDE4OTUxMzAw",
};

const CHANNELS = {
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
  SYNC_CHAIN: "SYNC_CHAIN",
  TESTING_CHANNEL: "TESTING_CHANNEL",
};


class PubSub {
  //initialize the blockchain props
  constructor({ blockchain, currentHttpPort, transactionPool, wallet }) {
    this.blockchain = blockchain;
    this.currentHttpPort = currentHttpPort;
    this.transactionPool = transactionPool;
    this.wallet = wallet;

    this.pubNub = new PubNub(credentials);
    //subscribe to available channels
    this.pubNub.subscribe({ channels: Object.values(CHANNELS) });

    //listen to message event that get fired within the overall network
    this.pubNub.addListener(this.listener());
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
              this.transactionPool.clearBlockchainTransactions({
                chain: parsedMessage.data,
              });
            });
            break;
          case CHANNELS.TRANSACTION:
            if (parsedMessage.data.input.address !== this.wallet.publicKey) {
              this.transactionPool.setTransaction(parsedMessage.data);
            } else {
              console.log(
                "TRANSACTION broadcast received from self, ignoring.."
              );
            }
            break;
          /**
           * When new node is initialized, publish to sync with other chains on the network
           */
          case CHANNELS.SYNC_CHAIN:
            this.broadcastChain();
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

  syncChainSignal = () => {
    this.publish({
      channel: CHANNELS.SYNC_CHAIN,
      messageContent: null,
    });
  };
}

module.exports = PubSub;
