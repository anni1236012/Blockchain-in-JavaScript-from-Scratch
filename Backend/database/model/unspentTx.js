const mongoose = require("mongoose");
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
const Tx = new Schema({
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

// Transaction Output Schema
const unspentTx = new Schema({
  Transaction: [Tx],
});

module.exports =
  mongoose.models.unspentTx || mongoose.model("unspentTx", unspentTx);
