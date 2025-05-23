// testing the library for generating a merkle tree
// using the merkletreejs library
// and crypto-js for hashing
const { MerkleTree } = require('merkletreejs')
const SHA256 = require('crypto-js/sha256')


const testcoords = [
    [10, 20],
    [10, 10],
    [50, 60],
    [70, 80]
]

const leaves = testcoords.map(coord => SHA256(JSON.stringify(coord)).toString());
const tree = new MerkleTree(leaves, SHA256, { sort: true });
console.log(tree.toString());
const root = tree.getRoot().toString('hex');
console.log('Merkle Root:', root);