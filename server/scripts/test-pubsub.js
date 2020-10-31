const PubSub = require("../util/pubsub");
const BlockChain = require("../blockchain/blockchain");

const blockChain = new BlockChain();
const testPubSub = new PubSub(blockChain);
testPubSub.publish("TESTING_CHANNEL", "Hello World");
