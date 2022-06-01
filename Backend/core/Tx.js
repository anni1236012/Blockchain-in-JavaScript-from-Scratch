const { Script } = require("./ECC/Script");
const {
  intToLittleEndian,
  bytesNeeded,
  sha256Double,
  encodeVarint,
  base58Decode,
  bigIntToBuffer,
  bufferToBigInt,
} = require("../util/util");
// const ZERO_HASH = "0".repeat(64);
const ZERO_HASH = Buffer.from("\0".repeat(32));
const PREV_INDEX = 0xffffffff;
const COIN = 100000000n;
const REWARD = 50n;
SIGHASH_ALL = 1;
const PRIVATE_KEY =
  32587332352809799541453612933543753364348100567730452502746377181865556118162n;
// MINER_ADDRESS = "18r59awEYdCBpcSznSnerinbdNnrKu7HtN";
MINER_ADDRESS = "1Gzh5Y5DrBm9NG6DvVQ6UDCLxEDd2B6o9M";

class Coinbase {
  constructor(blockHeight) {
    // this.blockHeight = intToLittleEndian(blockHeight);
    this.blockHeight = Buffer.from(blockHeight.toString());
  }

  CoinbaseTx() {
    const tx_ins = [];
    tx_ins.push(new TxIn(ZERO_HASH, PREV_INDEX));
    tx_ins[0].script_sig.cmds.push(this.blockHeight);

    const tx_outs = [];
    const targetAmount = REWARD * COIN;

    const targetHash160 = Buffer.from(base58Decode(MINER_ADDRESS), "hex");
    const targetScript = Script.p2pkhScript(targetHash160);
    tx_outs.push(new TxOut(targetAmount, targetScript));
    const coinBaseTx = new Tx(1, tx_ins, tx_outs, 0);
    coinBaseTx.TxId = coinBaseTx.id();
    return coinBaseTx;
  }
}

// Create transaction class
class Tx {
  constructor(version, tx_ins, tx_outs, locktime) {
    this.version = version;
    this.tx_ins = tx_ins;
    this.tx_outs = tx_outs;
    this.locktime = locktime;
  }

  // Transaction ID
  id() {
    return this.hash().toString("hex");
  }

  hash() {
    return sha256Double(this.serialize()).reverse();
  }

  serialize() {
    const result = [intToLittleEndian(this.version, 4)];
    result.push(encodeVarint(this.tx_ins.length));

    for (let i = 0; i < this.tx_ins.length; i++) {
      result.push(this.tx_ins[i].serialize());
    }

    result.push(encodeVarint(this.tx_outs.length));

    for (let i = 0; i < this.tx_outs.length; i++) {
      result.push(this.tx_outs[i].serialize());
    }

    result.push(intToLittleEndian(this.locktime, 4));

    return Buffer.concat(result);
  }

  // signature hash
  sighHash(inputIndex, scriptPubKey) {
    const s = [intToLittleEndian(this.version, 4)];
    s.push(encodeVarint(this.tx_ins.length));

    for (const [index, tx_in] of this.tx_ins.entries()) {
      if (index === inputIndex) {
        s.push(
          new TxIn(tx_in.prev_tx, tx_in.prev_index, scriptPubKey).serialize()
        );
      } else {
        s.push(new TxIn(tx_in.prev_tx, tx_in.prev_index).serialize());
      }
    }

    s.push(encodeVarint(this.tx_outs.length));

    for (const tx_out of this.tx_outs) {
      s.push(tx_out.serialize());
    }

    s.push(intToLittleEndian(this.locktime, 4));
    s.push(intToLittleEndian(SIGHASH_ALL, 4));
    let finalS = s[0];
    for (let i = 1; i < s.length; i++) {
      finalS = Buffer.concat([finalS, s[i]]);
    }
    const h256 = sha256Double(finalS);
    // console.log(h256);
    return bufferToBigInt(h256);
  }

  //sign input
  signInput(inputIndex, privateKey, scriptPubKey) {
    const z = this.sighHash(inputIndex, scriptPubKey);
    const der = privateKey.sign(z).der();
    console.log(der.toString("hex"));
    const sig = Buffer.concat([der, Buffer.from([SIGHASH_ALL])]);
    // const sig = Buffer.concat([der, bigIntToBuffer(SIGHASH_ALL)]);
    // console.log(sig.toString("hex"));
    const sec = privateKey.point.sec();
    // console.log(sec.toString("hex"));
    this.tx_ins[inputIndex].script_sig = new Script([sig, sec]);
    return this.verifyInput(inputIndex, scriptPubKey);
  }

  //verify Input
  verifyInput(inputIndex, script_pubkey) {
    const tx_in = this.tx_ins[inputIndex];
    const scriptPubKey = script_pubkey;
    const z = this.sighHash(inputIndex, scriptPubKey);
    // const combine = new Script([
    //   ...tx_in.script_sig.cmds,
    //   ...script_pubkey.cmds,
    // ]);
    const combine = tx_in.script_sig.add(script_pubkey);
    return combine.evaluate(z);
  }

  isCoinbase() {
    if (this.tx_ins.length !== 1) {
      return false;
    }

    const firstInput = this.tx_ins[0];
    if (Buffer.from(firstInput.prev_tx).toString("hex") === ZERO_HASH) {
      return false;
    }

    if (firstInput.prev_indedx !== PREV_INDEX) {
      return false;
    }

    return true;
  }
}

// Transaction Input Class
class TxIn {
  constructor(prev_tx, prev_index, script_sig = null, sequence = 0xffffffff) {
    this.prev_tx = prev_tx;
    this.prev_index = prev_index;

    if (script_sig === null) {
      this.script_sig = new Script();
    } else {
      this.script_sig = script_sig;
    }

    this.sequence = sequence;
  }

  // Serialize TxIn
  serialize() {
    // Reverse the byte order in the Origional python code
    // const reverseTx = [this.prev_tx].reverse();
    const reverseTx = Buffer.from([...this.prev_tx].reverse());
    let result = Buffer.concat([
      reverseTx,
      intToLittleEndian(this.prev_index, 4),
      this.script_sig.serialize(),
      intToLittleEndian(this.sequence, 4),
    ]);
    return result;
  }
}

// Transaction Output class
class TxOut {
  constructor(amount, scriptPubKey) {
    this.amount = amount;
    this.scriptPubKey = scriptPubKey;
  }

  // serialize
  serialize() {
    let result = intToLittleEndian(this.amount, 8);
    return Buffer.concat([result, this.scriptPubKey.serialize()]);
  }
}

module.exports = { Tx, TxIn, TxOut, Coinbase };
