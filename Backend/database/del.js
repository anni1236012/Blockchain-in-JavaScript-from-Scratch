const connect = require("./dbtest");
const Block = require("./model/unspentTx");

//628c7a2dff0c049ec4fc6419
const main = async (TransId, outputIndex) => {
  try {
    conneection = await connect();
    const data1 = await Block.find({
      "Transaction.TxId": TransId,
    });

    for (let [index, data] of data1.entries()) {
      for (let [index1, tx] of data.Transaction.entries()) {
        if (tx.TxId === TransId) {
          const temp = `Transaction.${index}.tx_outs.${outputIndex}`;
          console.log({ [temp]: null });

          if (data.Transaction.length === 1 && tx.tx_outs.length === 1) {
            await Block.findByIdAndDelete(data._id.toString());
          } else {
            if (tx.tx_outs.length === 1) {
              const ObjId = `Transaction.${index}`;

              await Block.updateOne(
                { "Transaction.TxId": TransId },
                { $set: { [ObjId]: null } }
              );

              await Block.updateOne(
                { _id: data._id.toString() },
                { $pull: { Transaction: null } }
              );
            } else {
              await Block.updateOne(
                {
                  "Transaction.TxId": TransId,
                },
                { $set: { [temp]: null } }
              );
              const temp1 = `Transaction.${index}.tx_outs`;
              await Block.updateOne(
                {
                  "Transaction.TxId": TransId,
                },
                { $pull: { [temp1]: null } }
              );
            }
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
};
if (require.main === module) {
  main(
    "e46f946a7e20f86361e007cb89635bde6967e07dbf488f76c2a0c3c27966cf10",
    (outputIndex = 0)
  );
}

module.exports = main;
