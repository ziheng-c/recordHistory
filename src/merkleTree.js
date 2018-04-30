const reverse = require('buffer-reverse');

class MerkleTree {
  constructor(leaves, hashAlgorithm, options = {}) {
    this.leaves = leaves;
    this.hashAlgorithm = hashAlgorithm;
    this.layers = [leaves];
    this.isBitcoinTree = !!options.isBitcoinTree;
    this.createHashes(this.leaves);
  }

  getLeaves() {
    return this.leaves;
  }

  getLayers() {
    return this.layers;
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  createHashes(nodes) {
    if (nodes.length === 1) {
      return false;
    }

    const layerIndex = this.layers.length;

    this.layers.push([]);

    for (let i = 0; i < nodes.length - 1; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1];
      let data = null;

      if (this.isBitcoinTree) {
        data = Buffer.concat([reverse(left), reverse(right)]);
      } else {
        data = Buffer.concat([left, right]);
      }

      let hash = this.hashAlgorithm(data);

      if (this.isBitcoinTree) {
        hash = reverse(this.hashAlgorithm(data));
      }

      this.layers[layerIndex].push(hash);
    }

    if (nodes.length % 2 === 1) {
      let data = nodes[nodes.length - 1];
      let hash = data;

      if (this.isBitcoinTree) {
        data = Buffer.concat([reverse(data), reverse(data)]);
        hash = this.hashAlgorithm(data);
        hash = reverse(this.hashAlgorithm(data));
      }

      this.layers[layerIndex].push(hash);
    }

    this.createHashes(this.layers[layerIndex]);
  }

  getProof(leaf, index) {
    const proof = [];
    if (typeof index !== 'number') {
      index = -1;

      for (let i = 0; i < this.leaves.length; i++) {
        if (Buffer.compare(leaf, this.leaves[i]) === 0) {
          index = i;
        }
      }
    }

    if (index < 0) {
      return [];
    }

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const pairIndex = isRightNode ? index - 1 : index + 1;

      if (pairIndex < layer.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          data: layer[pairIndex]
        })
      }

      index = (index / 2) | 0;
    }

    return proof;
  }

  verify(proof, targetNode, root) {
    let hash = targetNode;
    if (!Array.isArray(proof) || !proof.length || !targetNode || !root) {
      return false
    }
    for (let i = 0; i < proof.length; i++) {
      const node = proof[i];
      const isLeftNode = (node.position === 'left');
      const buffers = [];

      if (this.isBitcoinTree) {
        buffers.push(reverse(hash));
        buffers[isLeftNode ? 'unshift' : 'push'](node.data);
        hash = this.hashAlgorithm(Buffer.concat(buffers));
        hash = reverse(this.hashAlgorithm(hash));
      } else {
        buffers.push(hash);
        console.log(buffers)
        console.log(buffers[isLeftNode ? 'unshift' : 'push'])
        buffers[isLeftNode ? 'unshift' : 'push'](node.data);
        hash = this.hashAlgorithm(Buffer.concat(buffers))
      }
    }

    return Buffer.compare(root, hash) === 0;
  }
}

module.exports = MerkleTree;
