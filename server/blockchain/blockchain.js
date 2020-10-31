const { REWARD_INPUT, MINING_REWARD } = require("../config");
const cryptoHash = require("../util/crypto-hash");
const Transaction = require("../wallet/transaction");
const Block = require("./block");

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    const block = Block.mineBlock({
      lastBlock: this.chain[this.chain.length - 1],
      data: data,
    });
    this.chain.push(block);
    console.log("NEW BLOCK ADDED");
  }

  replaceChain(chain, validateTransactions, onSuccess) {
    if (chain.length < this.chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }
    if (chain.length === this.chain.length) {
      console.error("Chain is synchronized");
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain must be valid");
      return;
    }
    if (validateTransactions && !this.validTransactionData({ chain })) {
      console.error("The incoming chain has invalid data");
      return;
    }
    //callback function after successful chain replacement
    if (onSuccess) onSuccess();

    console.log("replacing chain with", chain);
    this.chain = chain;
  }

  //#region chain validation
  /**
   * Chain Validation:
   * Rule 1: The starting block must be Genesis Block
   * Rule 2: The hash of previous chain must be the same
   *         as the lashHash of current chain
   * Rule 3: The encrypted data of current chain must be the same
   *         as the hash of current chain.
   *    * */

  static isValidChain(chain) {
    //Rule 1: The starting block must be Genesis Block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      console.error("The starting block is not Genesis Block");
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const actualLastHash = chain[i - 1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      const { timestamp, lastHash, hash, nonce, difficulty, data } = block;
      /**
       * Rule 2: The hash of previous chain must be the same
       *         as the lashHash of current chain
       * */
      if (lastHash !== actualLastHash) {
        console.error("hash of previous chain is different from lash hash");
        return false;
      }

      /**
       * Rule 3: The encrypted data of previous chain must be the same
       *         as the hash of current chain.
       **/
      const validatedHash = cryptoHash(
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty
      );
      if (hash !== validatedHash) {
        console.error(
          "encrypted data of current chain is different from last hash"
        );
        return false;
      }

      //prevent the difficulty jumps lower than previous
      if (Math.abs(lastDifficulty - difficulty) > 1) return false;
    }

    return true;
  }
  //#endregion chain validation

  //#region Transaction validation
  /**
   * Transaction Validation:
   * Rule 1: valid transaction inputs and amounts
   * Rule 2: only one reward
   * Rule 3: valid input balances according to history
   * Rule 4: a unique set of block transactions
   *    * */
  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for (let transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount += 1;
          // Rule 2: only one reward
          if (rewardTransactionCount > 1) {
            console.error("Miner rewards exceeds count");
            return false;
          }
          // Rule 1: valid transaction inputs and amounts (Mining reward)
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner reward amount is invalid");
            return false;
          }
        } else {
          //Rule 1: valid transaction inputs and amounts
          if (!Transaction.validTransaction(transaction)) {
            console.error("Invalid transaction");
            return false;
          }

          //Rule 3: valid input balances according to history
          // const trueBalance = Wallet.calculateBalance({
          //   chain: this.chain,
          //   address: transaction.input.address,
          // });

          // if (transaction.input.amount !== trueBalance) {
          //   console.error(
          //     `Invalid input amount trueBalance ${trueBalance} vs ${transaction.input.amount} from ${transaction.input.address}`
          //   );
          //   return false;
          // }

          //Rule 4: a unique set of block transactions
          if (transactionSet.has(transaction)) {
            console.error(
              "An identical transaction appears more than once in the block"
            );
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }
    return true;
  }
  //#region Transaction validation
}

module.exports = Blockchain;
