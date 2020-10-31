const { START_BALANCE } = require("../config");
const { ec } = require("../util/verify-signature");
const cryptoHash = require("../util/crypto-hash");
const Transaction = require("./transaction");

class Wallet {
  constructor() {
    this.balance = START_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  sign(outputMapData) {
    return this.keyPair.sign(cryptoHash(outputMapData));
  }

  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }

    if (amount > this.balance) {
      throw new Error("Amount exceeds balance");
    }
    return new Transaction({ senderWallet: this, recipient, amount });
  }

  /**
   * Traverse via the blockchain to get the transaction data 
   * in order to calculate the balance
   */
  static calculateBalance({ chain, address }) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    //MUST traverse from the latest transaction in the block
    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];
     
      //bug fix: to get the latest transaction
      for (let transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }
       
        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction
      ? outputsTotal
      : START_BALANCE + outputsTotal;
  }

  getPublicKey() {
    return this.publicKey;
  }
}

module.exports = Wallet;
