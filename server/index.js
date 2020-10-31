const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const Blockchain = require("./blockchain/blockchain");
const PubSub = require("./util/pubsub");
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet/wallet");
const TransactionMiner = require("./wallet/transaction-miner");

const { DEFAULT_HTTP_PORT } = require("./config");

const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT || DEFAULT_HTTP_PORT;

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({
  blockchain,
  currentHttpPort: HTTP_PORT,
  transactionPool,
  wallet,
});
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
});
const app = express();

//#region Run client code
const DIST_DIR = path.join(__dirname, "../dist/");
const HTML_FILE = path.join(DIST_DIR, "index.html");

app.use(express.static(DIST_DIR));
//#endregion Run client code

//using the body parser middleware
app.use(bodyParser.json());

/**
 * test function of broadcastChain
 */
//setTimeout(() => pubsub.broadcastChain(), 1000);

//#region APIs
app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.get("/api/blocks/length", (req, res) => {
  res.json(blockchain.chain.length);
});

app.get("/api/blocks/:id", (req, res) => {
  const { id } = req.params;
  const { length } = blockchain.chain;

  //get the copy array of the blockchain, and reverse the array
  const blocksReversed = blockchain.chain.slice().reverse();

  let startIndex = (id - 1) * 5;
  let endIndex = id * 5;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
});

//get the addresses that can be found in Blockchain
app.get("/api/known-addresses", (req, res) => {
  const addressMap = {};

  for (let block of blockchain.chain) {
    for (let transaction of block.data) {
      const recipient = Object.keys(transaction.outputMap);
      recipient.forEach((recipient) => (addressMap[recipient] = recipient));
    }
  }
  res.json(Object.keys(addressMap));
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain,
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }

  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  res.json({ type: "success", transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transactions", (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect("/api/blocks");
});

//get the publicKey
app.get("/api/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain.chain,
      address: wallet.publicKey,
    }),
  });
});

//get the addresses that can be found in Blockchain
app.get("/api/known-addresses", (req, res) => {
  const addressMap = {};

  for (let block of blockchain.chain) {
    for (let transaction of block.data) {
      const recipient = Object.keys(transaction.outputMap);
      recipient.forEach((recipient) => (addressMap[recipient] = recipient));
    }
  }
  res.json(Object.keys(addressMap));
});

//#endregion APIs

/**
 * Entry of Express: //Go to frontend main page
 */
app.get("*", (req, res) => {
  res.sendFile(HTML_FILE);
});

const syncOtherChains = () => {
  pubsub.syncChainSignal();
};

//#region GENERATE DUMMY Transactions
if (process.env.ENV === "DEVELOPMENT") {
  const walletFoo = new Wallet();
  const walletBar = new Wallet();

  const generateWalletTransaction = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({
      recipient,
      amount,
      chain: blockchain.chain,
    });

    transactionPool.setTransaction(transaction);
  };

  const walletAction = () =>
    generateWalletTransaction({
      wallet,
      recipient: walletFoo.publicKey,
      amount: 5,
    });

  const walletFooAction = () =>
    generateWalletTransaction({
      wallet: walletFoo,
      recipient: walletBar.publicKey,
      amount: 10,
    });

  const walletBarAction = () =>
    generateWalletTransaction({
      wallet: walletBar,
      recipient: wallet.publicKey,
      amount: 15,
    });

  for (let i = 0; i < 10; i++) {
    if (i % 3 === 0) {
      walletAction();
      walletFooAction();
    } else if (i % 3 === 1) {
      walletAction();
      walletBarAction();
    } else {
      walletFooAction();
      walletBarAction();
    }
    transactionMiner.mineTransactions();
  }
}
//#endregion DUMMY Transactions

//listen to http server
app.listen(HTTP_PORT, () => {
  console.log(`listening HTTP at localhost:${HTTP_PORT}`);
  syncOtherChains();
});
