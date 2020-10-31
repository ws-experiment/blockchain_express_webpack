const { v4: uuidv4 } = require("uuid");
const { verifySignature } = require("../util/verify-signature");
const { MINING_REWARD, REWARD_INPUT } = require("../config");

class Transaction {
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuidv4();

    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, recipient, amount });

    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });

  }

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};

    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    outputMap[recipient] = amount;

    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  update({ senderWallet, recipient, amount }) {
    //throw exception if balance amount is not sufficient
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds balance");
    }

    //if the recipient of the transaction does not exist,
    //the transaction is invalid
    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static validTransaction(transaction) {
    const { input, outputMap } = transaction;
    const { address, amount, signature } = input;

    const outputTotal = Object.values(outputMap).reduce(
      (total, outputAmount) => total + outputAmount
    );

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      console.log("values", `${amount} ${outputTotal}`);
      return false;
    }

    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
    });
  }
}
module.exports = Transaction;
