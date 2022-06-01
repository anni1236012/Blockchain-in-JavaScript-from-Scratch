const io = require("socket.io")(3600, { cors: { origin: "*" } });
const list = [];

class Blockchain {
  constructor() {
    this.unConfirmedTxs = [];
  }

  async startServer() {
    io.on("connection", (socket) => {
      console.log(`User is connected ${socket.id}`);
      socket.emit("message", "Hello from server");
      socket.on("sendTx", (data) => {
        this.unConfirmedTxs.push(data);
        console.log(this.unConfirmedTxs);
      });
    });
  }
}

const blockchain = new Blockchain();
blockchain.startServer();
