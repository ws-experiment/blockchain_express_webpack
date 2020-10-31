const Blockchain = require("../blockchain/blockchain");

const blockChain = new Blockchain();
blockChain.addBlock({ data: "first-data " });

console.log("first block", blockChain.chain[blockChain.chain.length - 1]);

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i < 1000; i++) {
  prevTimestamp = blockChain.chain[blockChain.chain.length - 1].timestamp;
  blockChain.addBlock({ data: `block {i}` });

  nextBlock = blockChain.chain[blockChain.chain.length - 1];
  nextTimestamp = nextBlock.timestamp;

  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);
  average = times.reduce((total, num) => total + num) / times.length;

  console.log(
    `Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`
  );
}
