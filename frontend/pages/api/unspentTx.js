const unspentSchema = require("../../../Backend/database/model/unspentTx");
const { base58Decode } = require("../../../Backend/util/util");
const connect = require("../../../Backend/database/dbtest");
const createTransaction = require("../../../Backend/core/prepareTx");

export default async function fetchUnspentTx(req, res) {
  try {
    await connect();
  } catch (error) {
    console.log(error);
  }

  const { priv, fromAddress, toAddress, Amount } = req.body;

  let publicKeyHash = "";
  if (fromAddress[0] === "1" && fromAddress.length === 34) {
    publicKeyHash = base58Decode(fromAddress);
  } else {
    publicKeyHash = fromAddress;
  }

  let amount = 0;
  const Inputs = [];
  const cursor = unspentSchema
    .find({
      "Transaction.tx_outs.scriptPubKey.cmds.2": Buffer.from(
        publicKeyHash,
        "hex"
      ),
    })
    .cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    if (amount < Amount) {
      doc.Transaction.forEach((tx) => {
        console.log(`Transaction ID using as an Input: ${tx.TxId}`);
        let flag = false;
        tx.tx_outs.forEach((txOut) => {
          txOut.scriptPubKey.cmds[2] =
            txOut.scriptPubKey.cmds[2].toString("hex");
          if (amount < Amount) {
            if (txOut.scriptPubKey.cmds[2] === publicKeyHash) {
              amount += parseInt(txOut.amount);

              if (!flag) {
                flag = true;
                Inputs.push(doc.Transaction);
              }
            }
          } else {
            return;
          }
        });
      });
    } else {
      break;
    }
  }
  cursor.close();

  const TxObj = await createTransaction(priv, toAddress, Amount, Inputs);

  res.status(200).json({ data: TxObj });
}
