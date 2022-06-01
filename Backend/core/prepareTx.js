const { Tx, TxIn, TxOut } = require("./Tx");
const { Script } = require("./ECC/Script");
const { base58Decode } = require("../util/util");
const { PrivateKey } = require("./ECC/Elliptic");
const connect = require("../database/dbtest");
const createKeys = require("./wallet");
const COIN = 100000000n;

class createTx {
  constructor(PrivateKey, ToAddress, Amount, Inputs) {
    this.PrivateKey = PrivateKey;
    this.ToAddress = ToAddress;
    this.Amount = BigInt(Amount);
    this.Inputs = Inputs;
  }
  // create pay to Public key Hash
  createP2PKH(PublicAddress) {
    const pubKeyHash = base58Decode(PublicAddress);
    // Create a new scriptPubKey
    const scriptPubKey = Script.p2pkhScript(pubKeyHash);
    // convert pubKeyHash to bytes
    scriptPubKey.cmds[2] = Buffer.from(scriptPubKey.cmds[2], "hex");
    return scriptPubKey;
  }

  addSignature(TxObj) {
    for (let [InputIdx, input] of TxObj.tx_ins.entries()) {
      console.log(
        TxObj.signInput(
          InputIdx,
          new PrivateKey(this.PrivateKey),
          this.fromScriptPubKey
        )
      );
    }
  }

  fetchSpentTxs() {
    // Generate Public address from the given Private Key
    const PublicAddress = new createKeys(this.PrivateKey).createPublicKey();
    this.fromScriptPubKey = this.createP2PKH(PublicAddress);
    const toScriptPubKey = this.createP2PKH(this.ToAddress);
    const Inputs = [];

    let TotalAmount = 0n;
    for (let [InputIdx, input] of this.Inputs.entries()) {
      for (let [TxIndex, tx] of input.entries()) {
        for (let [index, output] of tx.tx_outs.entries()) {
          if (TotalAmount < this.Amount) {
            if (
              output.scriptPubKey.cmds[2] ===
              this.fromScriptPubKey.cmds[2].toString("hex")
            ) {
              TotalAmount += BigInt(output.amount);
              Inputs.push(new TxIn(Buffer.from(tx.TxId, "hex"), index));
            }
          } else {
            break;
          }
        }
      }
    }
    const changeAmt = TotalAmount - this.Amount;

    const Outputs = [
      new TxOut(this.Amount, toScriptPubKey),
      new TxOut(changeAmt, this.fromScriptPubKey),
    ];
    const TxObj = new Tx(1n, Inputs, Outputs, 0);
    this.addSignature(TxObj);
    TxObj.version = parseInt(TxObj.version);
    TxObj.tx_outs.forEach((txOut) => {
      txOut.amount = parseInt(txOut.amount);
    });
    TxObj.TxId = TxObj.id();
    return TxObj;
  }

  main() {
    return this.fetchSpentTxs();
  }
}

const createTransaction = async (priv = null, toAddress, Amount, Inputs) => {
  try {
    mongoose = await connect();

    priv = BigInt(priv);
    const newTX = new createTx(priv, toAddress, Amount, Inputs);
    return newTX.main();
  } catch (err) {
    console.log("Error while con", err);
  }
};

if (require.main === module) {
  createTransaction();
}

module.exports = createTransaction;
