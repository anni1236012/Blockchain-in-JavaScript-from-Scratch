const Block = require("../../../Backend/database/model/blockSchema");
import connect from "../../../Backend/database/dbtest";

export default async function fetchTx(req, res) {
  const TxId = req.query.TxId;

  res.status(200).json(await Block.find({ "Transactions.TxId": TxId }));
}
