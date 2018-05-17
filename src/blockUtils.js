const CryptoJS = require("crypto-js");
const Block = require("./block.js");
const fs = require("fs");
const config = require("../config.json");

const localDataPath = config.localDataPath;
console.log(localDataPath)

const calculateHashForBlock = (block) => {
  return new Block(block.index, block.previousHash, block.timestamp, block.data).hash;
};

const getGenesisBlock = () => {
  return new Block(0, "0", 1411603200, "my genesis block!!");
};

let blockchain;

const InitializeBlockChain = () => {
  if (fs.existsSync(localDataPath)) {
    const tempBlockChain = fs.readFileSync(localDataPath, 'utf8');
    if (isValidChain(JSON.parse(tempBlockChain))) {
      blockchain = JSON.parse(tempBlockChain);
    } else {
      blockchain = [getGenesisBlock()];
      writeToLocal(blockchain);
    }
  } else {
    blockchain = [getGenesisBlock()];
    writeToLocal(blockchain);
  }
}

const generateNextBlock = (blockData) => {
  const previousBlock = getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Date().getTime() / 1000 | 0;
  return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData);
};

const addBlock = (newBlock) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockchain.push(newBlock);
    writeToLocal(blockchain);
  }
};

const isValidNewBlock = (newBlock, previousBlock) => {
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log('invalid index');
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log('invalid previoushash');
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.log(typeof(newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
    console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
    return false;
  }
  return true;
};

const getLatestBlock = () => blockchain[blockchain.length - 1];

const replaceChain = (newBlocks) => {
  if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
    console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
    blockchain = newBlocks;
    writeToLocal(blockchain);
    broadcast(responseLatestMsg());
  } else {
    console.log('Received blockchain invalid');
  }
};

const isValidChain = (blockchainToValidate) => {
  if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(getGenesisBlock())) {
    return false;
  }
  const tempBlocks = [blockchainToValidate[0]];
  for (let i = 1; i < blockchainToValidate.length; i++) {
    if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
      tempBlocks.push(blockchainToValidate[i]);
    } else {
      return false;
    }
  }
  return true;
};

const getBlockChain = () => {
  return blockchain;
}

const writeToLocal = (data) => {
  fs.writeFileSync(localDataPath, JSON.stringify(data));
}

module.exports = {
  addBlock,
  calculateHashForBlock,
  generateNextBlock,
  getBlockChain,
  getGenesisBlock,
  getLatestBlock,
  InitializeBlockChain,
  isValidChain,
  isValidNewBlock,
  replaceChain
}
