require("dotenv").config();
const block = require("./block");
const blockchain = require("./blockHeader");
const Block = require("../database/model/blockSchema");
const unspentTx = require("../database/model/unspentTx");
const connect = require("../database/dbtest");
const getLastBlock = require("../database/read");
const { Coinbase } = require("./Tx");
const {
  createMerkleRoot,
  bits_to_target,
  target_to_bits,
} = require("../util/util");
const { Tx, TxIn, TxOut } = require("./Tx");
const { Script } = require("./ECC/Script");
MAX_TARGET =
  0x0000ffff00000000000000000000000000000000000000000000000000000000n;
INITIAL_TARGET =
  0x0000ffff00000000000000000000000000000000000000000000000000000000n;

/*
# Calculate new Target to keep our Block mine time under 3 seconds
# Reset Block Difficulty after every 10 Blocks
*/
const AVERAGE_BLOCK_MINE_TIME = 3;
const RESET_DIFFICULTY_AFTER_BLOCKS = 10;
const AVERAGE_MINE_TIME =
  AVERAGE_BLOCK_MINE_TIME * RESET_DIFFICULTY_AFTER_BLOCKS;

const {
  Worker,
  workerData,
  parentPort,
  isMainThread,
  SHARE_ENV,
} = require("worker_threads");

VERSION = 1;
const ZERO_HASH = String("0").padStart(64, "0");

let mongoose = "";
// This will automatically convert BIGINT to String when you try JSON.stringify()
// https://github.com/GoogleChromeLabs/jsbi/issues/30
BigInt.prototype.toJSON = function () {
  return this.toString();
};

class Blockchain {
  constructor() {
    this.unConfirmedTxs = [];
    this.memPool = {};
    this.trackSpentTxs = {};
    this.tempTrackSpentTxs = {};
    this.isReady = true;
    this.currentTarget = INITIAL_TARGET;
    this.bits = target_to_bits(INITIAL_TARGET);
  }

  /*
  Genesis Block is the very First Block in the Blockchain
  */
  async GenesisBlock(worker) {
    try {
      const BlockHeight = 0;
      const prevBlockHash = ZERO_HASH;
      await this.addBlock(BlockHeight, prevBlockHash, worker);
    } catch (err) {
      console.log(`Error in Genesis Blockchain Function \n ${err}`);
    }
  }

  replacer(key, value) {
    if (key === "big") {
      return value.toString();
    }
    return value;
  }
  /*
  Retreive the target difficulty of the last epoch block
  */
  async retreiveTargetDifficultyOfBlock(blockNumber) {
    const block = await Block.find({ Height: blockNumber });
    const prevBlockTimestamp = block[0].blockHeader.timestamp;
    this.bits = block[0].blockHeader.bits;
    return prevBlockTimestamp;
  }

  /*
  Adjust Target diffuculty after every 10 Blocks
  Average Block Mine Time is 3 seconds 
  but you can adjust it by changing the AVERAGE_BLOCK_MINE_TIME variable 
  ==> If Block is mined in less than 3 seconds then increase the difficulty
  ==> If Block is mined in more than 3 seconds then decrease the difficulty
  */

  async adjustBlockDifficulty(BlockHeight, lastBlockTimestamp) {
    if (BlockHeight % 10 == 0) {
      this.chnageBlockDifficultyInProgress = true;

      let NEW_TARGET = 0;
      const prevBlockTimestamp = await this.retreiveTargetDifficultyOfBlock(
        BlockHeight - 10
      );
      const lasttarget = bits_to_target(Buffer.from(this.bits, "hex"));
      // Time in milliseconds
      const AverageBlockMineTime =
        (lastBlockTimestamp - prevBlockTimestamp) / 1000;

      const timeRatio = AverageBlockMineTime / AVERAGE_MINE_TIME;
      NEW_TARGET = BigInt(parseInt(lasttarget) * timeRatio);

      if (NEW_TARGET > MAX_TARGET) {
        NEW_TARGET = MAX_TARGET;
      }
      this.currentTarget = NEW_TARGET;
      this.bits = target_to_bits(NEW_TARGET);
    }
  }

  /*
  Remove the Transactions that have been included in the Block to avoid double spending
  */
  async removeSpentUTXOS(TransId, outputIndex) {
    try {
      const data1 = await unspentTx.find({
        "Transaction.TxId": TransId,
      });

      for (let [index, data] of data1.entries()) {
        for (let [index1, tx] of data.Transaction.entries()) {
          if (tx.TxId === TransId) {
            const temp = `Transaction.${index1}.tx_outs.${outputIndex}`;

            if (data.Transaction.length === 1 && tx.tx_outs.length === 1) {
              await unspentTx.findByIdAndDelete(data._id.toString());
            } else {
              if (tx.tx_outs.length === 1) {
                const ObjId = `Transaction.${index}`;

                await unspentTx.updateOne(
                  { "Transaction.TxId": TransId },
                  { $set: { [ObjId]: null } }
                );

                await unspentTx.updateOne(
                  { _id: data._id.toString() },
                  { $pull: { Transaction: null } }
                );
              } else {
                await unspentTx.updateOne(
                  {
                    "Transaction.TxId": TransId,
                  },
                  { $set: { [temp]: null } }
                );
                const temp1 = `Transaction.${index1}.tx_outs`;
                await unspentTx.updateOne(
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
  }

  /*
  addBlock function will add all the transactions in the memPool to the Block
  it will mine the Block and add it to the Blockchain
  If you want to add a check of Block size 
  but since we are not publishing too many transactions so it is okay in this case
  */
  async addBlock(BlockHeight, prevBlockHash, worker) {
    const coinbase = new Coinbase(BlockHeight);
    const coinbaseTx = coinbase.CoinbaseTx();
    this.unConfirmedTxs.splice(0, 0, coinbaseTx);
    let timestamp = Date.now();
    let merkleRoot = createMerkleRoot(this.unConfirmedTxs);
    let blockHeader = new blockchain.BlockHeader(
      VERSION,
      prevBlockHash,
      merkleRoot,
      timestamp,
      this.bits
    );
    let transactions = [...this.unConfirmedTxs];

    // this.unConfirmedTxs = [] should be above the await block
    // else it will wipe out the unconfirmed txs that you retreive from the sockets
    // before the below await keyword everything works in synchronous manner
    // but when you hit the await keyword if there are any pending callbacks it will execute them
    // which is sockets in our case and then it will start executing the rest of the code after await Promise.all

    this.unConfirmedTxs = [];
    let tempArr = { ...this.tempTrackSpentTxs };
    this.tempTrackSpentTxs = {};
    if (BlockHeight > 0) {
      await this.adjustBlockDifficulty(BlockHeight, timestamp);
    }

    blockHeader.mine(this.currentTarget);
    let bits = this.bits.toString("hex");

    let BlockObj = {
      Height: BlockHeight,
      BlockSize: 1,
      blockHeader: {
        version: 1,
        prevBlockHash: blockHeader.prevBlockhash,
        merkleroot: merkleRoot,
        timestamp: timestamp,
        bits: bits,
        nonce: blockHeader.nonce,
        blockhash: blockHeader.blockhash,
      },
      TxCount: transactions.length,
      Transactions: transactions,
    };

    let unspent = { Transaction: transactions };

    // Mongoose Schema, Write data
    try {
      await Promise.all([
        new Block(BlockObj).save(),
        new unspentTx(unspent).save(),
      ]);

      for (let txId in tempArr) {
        await this.removeSpentUTXOS(txId, tempArr[txId]);
      }

      // Inform the worker thread to remove the confirmeed Transactions from the memPool
      worker.postMessage(this.memPool);
      this.memPool = {};

      tempArr = {};
      this.isReady = true;
      this.chain = new block.Block(BlockHeight, 1, blockHeader, 1, coinbaseTx);

      if (this.isReady && BlockHeight > 0) {
        setTimeout(async () => {
          await this.asyncWhile(worker);
        }, 0);
      }
    } catch (err) {
      console.log(`Error in addBlock Function \n ${err}`);
    }
  }

  /*
asyncWhile will run contineously without blocking the main event loop
*/
  async asyncWhile(worker) {
    if (this.isReady) {
      this.isReady = false;
      let lastBlock = this.chain;
      let Blockheight = lastBlock.Height + 1;
      let prevBlockHash = lastBlock.blockHeader.blockhash;
      await this.addBlock(Blockheight, prevBlockHash, worker);
    }
  }

  // Main Function to trigger the process
  async main() {
    /*
    Start Server and listen for incoming transactions and add them in the memPool
    without Blocking the main event loop
    */
    const worker = new Worker("./mempool.js", { env: SHARE_ENV });
    process.env.SendTxs = false;

    worker.on("message", (transaction) => {
      if (transaction !== null) {
        const tx_ins = [];
        const tx_outs = [];

        transaction.tx_ins.forEach((tx) => {
          tx.prev_tx = Buffer.from(tx.prev_tx);
          tx.script_sig.cmds[0] = Buffer.from(tx.script_sig.cmds[0]);
          tx.script_sig.cmds[1] = Buffer.from(tx.script_sig.cmds[1]);
          tx_ins.push(
            new TxIn(tx.prev_tx, tx.prev_index, new Script(tx.script_sig.cmds))
          );

          this.tempTrackSpentTxs[Buffer.from(tx.prev_tx).toString("hex")] =
            tx.prev_index;
        });

        transaction.tx_outs.forEach((tx) => {
          tx_outs.push(
            new TxOut(BigInt(tx.amount), new Script(tx.scriptPubKey.cmds))
          );
        });

        let tempTx = new Tx(1, tx_ins, tx_outs, 0);
        tempTx.TxId = tempTx.id();
        this.memPool[tempTx.TxId] = 0;
        this.unConfirmedTxs.push(tempTx);
        console.log("Total Transactions :", this.unConfirmedTxs.length);
      }
    });

    const lastBlock = await getLastBlock.main(true);
    this.chain = lastBlock[0];

    if (!this.chain) {
      await this.GenesisBlock(worker);
    } else {
      this.currentTarget = bits_to_target(
        Buffer.from(this.chain.blockHeader.bits, "hex")
      );
      this.bits = Buffer.from(this.chain.blockHeader.bits, "hex");
    }
    await this.asyncWhile(worker);
  }
}

const createConnection = async () => {
  try {
    mongoose = await connect();
    const blockchain = new Blockchain();
    blockchain.main();
  } catch (err) {
    console.log("Error while con", err);
  }
};

createConnection();
