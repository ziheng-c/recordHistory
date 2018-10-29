const CryptoJS = require("crypto-js");

class Block {
  constructor(index, previousHash, timestamp, data) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    this.difficulty = 4;
    this.nonce = 0;
    this.hash = this.calculateHash(index, previousHash, timestamp, data);
  }

  calculateHash(index, previousHash, timestamp, data) {
    while(true){
      const hash =CryptoJS.SHA256(index + previousHash + timestamp + data + this.nonce).toString();
      if(hash.substring(0, this.difficulty) === '0000'){
        return hash
      }
      this.nonce ++ ;
    }
  }
}

module.exports = Block;
