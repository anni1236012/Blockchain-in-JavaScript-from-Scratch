const mongoose = require("mongoose");
const { Script } = require("../../core/ECC/Script");
const Schema = mongoose.Schema;

// Transation Input Schema
const TxIn = new Schema({
  prev_tx: {
    type: Buffer,
    required: true,
  },
  prev_index: {
    type: Number,
    required: true,
  },
  script_sig: {
    cmds: [],
  },
  sequence: {
    type: Number,
    required: true,
  },
});

// Transaction Output Schema
const TxOut = new Schema({
  amount: {
    type: String,
    required: true,
  },
  scriptPubKey: {
    cmds: [],
  },
});

// Transaction Schema
const Transaction = new Schema({
  version: {
    type: Number,
    required: true,
  },
  tx_ins: [TxIn],
  tx_outs: [TxOut],
  locktime: {
    type: Number,
    required: true,
  },
  TxId: {
    type: String,
    required: true,
  },
});

const blockHeader = new Schema({
  version: {
    type: Number,
    required: true,
  },
  prevBlockHash: {
    type: String,
    required: true,
  },
  merkleroot: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  bits: {
    type: String,
    required: true,
  },
  nonce: {
    type: Number,
    required: true,
  },
  blockhash: {
    type: String,
    required: true,
  },
});

// Block Schema
const blockSchema = new Schema({
  Height: {
    type: Number,
    required: true,
  },
  BlockSize: {
    type: Number,
    require: true,
  },
  blockHeader: blockHeader,
  TxCount: {
    type: Number,
    required: true,
  },
  Transactions: [Transaction],
});

module.exports =
  mongoose.models.blockSchema || mongoose.model("blockSchema", blockSchema);
