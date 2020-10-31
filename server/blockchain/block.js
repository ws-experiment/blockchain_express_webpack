const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require("../config");
const cryptoHash = require('../util/crypto-hash');

class Block {
  constructor({ blockId, timestamp, lastHash, hash, data, nonce, difficulty }) {
    
    this.blockId = blockId;
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    // /**
    //  * We’ll initial Nonce to 1. We need a way to append a changing value to our hash
    //  * that we create from our calculateHash function so if we don’t get the leading number of zeros we want,
    //  * we can try again with a new value.
    //  * This changing value we add to our concatenated string in cryptoHash is called a “Nonce”
    //  */
    this.nonce = nonce;
    // /**
    //  * difficulty is a constant that defines the number of 0s we want leading the hash.
    //  * The more zeros we have to get, the harder it is to find the correct hash.
    //  * We’ll just start with 1 zero.
    //  */
    this.difficulty = difficulty;
  }

  static genesis() {
    return new this(GENESIS_DATA);
  }

   /**
   * To understand more about Proof of Work,
   * https://medium.com/@mycoralhealth/code-your-own-blockchain-mining-algorithm-in-go-82c6a71aba1f
   */
  static mineBlock({ lastBlock, data }) {
    let hash, timestamp;

    const lastHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;
    let nonce = 0;

    const blockId  = lastBlock.blockId + 1;

    do {
      nonce++;
      timestamp = Date.now();
      //generate new difficulty if current block is not match
      difficulty = Block.adjustDifficulty({
        originalBlock: lastBlock,
        timestamp,
      });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    return new this({
      blockId,
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash,
    });
  }

  /**
   * Adjust the mine difficulty if the mine-rate is not equal to const MINE_RATE
   * */
  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    if (difficulty < 1) return 1;
    const difference = timestamp - originalBlock.timestamp;
    const adjustDifficulty =
      difference > MINE_RATE ? difficulty - 1 : difficulty + 1;

    return adjustDifficulty;
  }
}

module.exports = Block;
