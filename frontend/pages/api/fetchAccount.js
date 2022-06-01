const unspentSchema = require("../../../Backend/database/model/unspentTx");
const { base58Decode } = require("../../../Backend/util/util");
const connect = require("../../../Backend/database/dbtest");

export default async function fetchAccount(req, res) {
  try {
    await connect();
  } catch (error) {
    console.log(error);
  }

  const account = req.query.account;

  const publicKeyHash = base58Decode(account);
  const Inputs = [];
  let Accountbal = 0;
  const cursor = unspentSchema
    .find({
      "Transaction.tx_outs.scriptPubKey.cmds.2": Buffer.from(
        publicKeyHash,
        "hex"
      ),
    })
    .cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    doc.Transaction.forEach((tx) => {
      tx.tx_outs.forEach((txOut) => {
        const temp = txOut.scriptPubKey.cmds[2].toString("hex");
        console.log(txOut.scriptPubKey.cmds[2].toString("hex"));
        if (txOut.scriptPubKey.cmds[2].toString("hex") === publicKeyHash) {
          Accountbal += parseInt(txOut.amount);
          Inputs.push(tx);
        }
      });
    });
  }
  cursor.close();

  res.status(200).json({ data: Inputs, Accountbal, TxCount: Inputs.length });
}
