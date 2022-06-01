const io = require("socket.io-client");
const client = io.connect("http://localhost:3600");
const ADD_TX_IN_MEMPOOL = "ADD_TX_IN_MEMPOOL";
const REMOVE_CONFIRMED_TX_FROM_MEMPOOL = "REMOVE_CONFIRMED_TX_FROM_MEMPOOL";

// Request for Confirmed Tx so that we can remove it from mempool
// client.emit(REMOVE_CONFIRMED_TX_FROM_MEMPOOL) is sending the reuest to the server
export default async function Mempool(req, res) {
  client.on("connect", () => {
    console.log(
      `Connected to server ${client.id} and status is ${client.connected}`
    );
    client.emit(REMOVE_CONFIRMED_TX_FROM_MEMPOOL);
  });

  // Listen for Txs that are added in the last Block
  // And Remove them from the mempool
  client.on(REMOVE_CONFIRMED_TX_FROM_MEMPOOL, (data) => {
    console.log(`OnCleint side ${data.message}`);
    res.status(200).json({ data: data });
  });

  // Listen for New Unconfirmed Txs
  client.on(ADD_TX_IN_MEMPOOL, (data) => {
    console.log(`OnCleint side ${data.message}`);
  });
}
