const io = require("socket.io-client");
const client = io.connect("http://localhost:3600");
const ADD_TX_IN_MEMPOOL = "ADD_TX_IN_MEMPOOL";
const REMOVE_CONFIRMED_TX_FROM_MEMPOOL = "REMOVE_CONFIRMED_TX_FROM_MEMPOOL";
const createConnection = require("../CreateTx");
function Broadcast(TxObj) {
  client.on("connect", async () => {
    console.log(
      `Connected to server ${client.id} and status is ${client.connected}`
    );
    // const TxObj = await createConnection();

    client.emit(ADD_TX_IN_MEMPOOL, TxObj);
    client.close();
    // client.emit(ADD_TX_IN_MEMPOOL, {
    //   TxAll: [{ TXId: 12345n }, { TXId: 12345 }, { TXId: 12345 }],
    // });

    // Request for Transactions that are confirmed
    // client.emit(REMOVE_CONFIRMED_TX_FROM_MEMPOOL);
  });
}

// Listen for Txs that are added in the last Block
// And Remove them from the mempool
// client.on(REMOVE_CONFIRMED_TX_FROM_MEMPOOL, (data) => {
//   console.log(`OnCleint side ${data.message}`);
// });

module.exports = Broadcast;
