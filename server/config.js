//#region Block
const INITIAL_DIFFICULTY = 15;
const MINE_RATE = 1000;

const GENESIS_DATA = {
  blockId : 0,
  timestamp: 1,
  lastHash: "-----",
  hash: "hash-one",
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: [],
};
//#endregion Block

//#region Http Server
const DEFAULT_HTTP_PORT = 3000;
//#endregion Http Server

//#region Wallet
const START_BALANCE = 100;
const TRANSACTION_FEE = 1;
const REWARD_INPUT = {
  address: "*authorized-reward*",
  balance: "-"
};
const MINING_REWARD = 20;
//#endregion Wallet

module.exports = {
  INITIAL_DIFFICULTY,
  MINE_RATE,
  GENESIS_DATA,
  DEFAULT_HTTP_PORT,
  START_BALANCE,
  TRANSACTION_FEE,
  REWARD_INPUT,
  MINING_REWARD
};
