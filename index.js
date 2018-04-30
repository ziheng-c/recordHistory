const MerkleTree = require('./src/merkleTree')
const crypto = require('crypto')

function sha256(data) {
  // returns Buffer
  return crypto.createHash('sha256').update(data).digest()
}

const leaves = ['a', 'b', 'c'].map(x => sha256(x))

const tree = new MerkleTree(leaves, sha256)

const root = tree.getRoot();
const proof = tree.getProof(leaves[1])
const verified = tree.verify(proof, leaves[1], root);
console.log(verified)
