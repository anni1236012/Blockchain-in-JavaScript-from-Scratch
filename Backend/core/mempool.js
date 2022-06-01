const { parentPort } = require("worker_threads");
const { Tx, TxIn, TxOut } = require("./Tx");
const { Script } = require("./ECC/Script");
const io = require("socket.io")(3600, { cors: { origin: "*" } });

const ADD_TX_IN_MEMPOOL = "ADD_TX_IN_MEMPOOL";
const SEND_MEMPOOL = "SEND_MEMPOOL";
let UnconfirmedTxs = {};
const trackSpentTxs = {};
let externalSocket = "";

console.log(`Server is running on port 3600`);

// Txs Included in the Block
// Remove them from the mempool
parentPort.on("message", async (data) => {
  let count = 0;
  for (let TxId of Object.keys(data)) {
    delete UnconfirmedTxs[TxId];
    console.log(`Remove this Transaction Id: ${TxId}`);
    count++;
  }

  if (count > 0) {
    try {
      externalSocket.broadcast.emit(SEND_MEMPOOL, UnconfirmedTxs);
    } catch (error) {
      console.log(`Connect Refused to ${socket.id}\n${error}`);
    }
  }
});

io.on("connection", (socket) => {
  externalSocket = socket;
  // Listen for new Unconfirmed Txs
  // And send those transactions to the main Thread
  // To Include them in the next Block
  // When SendTxs is true, This flag is set to true in blockchain.js
  socket.on(ADD_TX_IN_MEMPOOL, (transaction) => {
    // socket.broadcast.emit(ADD_TX_IN_MEMPOOL, data);
    if (transaction !== null) {
      const tx_ins = [];
      let txCount = 0;
      transaction.tx_ins.forEach((tx) => {
        let prevTxHex = Buffer.from(tx.prev_tx.data).toString("hex");

        if (trackSpentTxs[prevTxHex] !== tx.prev_index) {
          tx.prev_tx = Buffer.from(tx.prev_tx, "hex");
          tx.script_sig.cmds[0] = Buffer.from(tx.script_sig.cmds[0], "hex");
          tx.script_sig.cmds[1] = Buffer.from(tx.script_sig.cmds[1], "hex");
          tx_ins.push(
            new TxIn(tx.prev_tx, tx.prev_index, new Script(tx.script_sig.cmds))
          );

          trackSpentTxs[Buffer.from(tx.prev_tx).toString("hex")] =
            tx.prev_index;
          // isInputReady = true;
          txCount++;
        } else {
          console.log(`Duplicate Transaction Received TxId:==> ${prevTxHex}`);
        }
      });

      if (txCount === transaction.tx_ins.length) {
        const tx_outs = [];
        transaction.tx_outs.forEach((tx) => {
          tx.scriptPubKey.cmds[2] = Buffer.from(tx.scriptPubKey.cmds[2], "hex");
          tx_outs.push(
            new TxOut(BigInt(tx.amount), new Script(tx.scriptPubKey.cmds))
          );
        });

        let tempTx = new Tx(1, tx_ins, tx_outs, 0);
        tempTx.TxId = tempTx.id();
        parentPort.postMessage(tempTx);
        tx_outs.forEach((tx) => {
          tx.amount = parseInt(tx.amount);
        });
        UnconfirmedTxs[tempTx.TxId] = tempTx;
        socket.broadcast.emit(SEND_MEMPOOL, UnconfirmedTxs);
      } else {
        console.log(
          `Not Enough balance to send this transaction TxId: ==>${transaction.TxId}`
        );
      }
    }
  });

  // Send the Complete Mempool to the client
  socket.on(SEND_MEMPOOL, () => {
    socket.emit(SEND_MEMPOOL, UnconfirmedTxs);
  });
});
