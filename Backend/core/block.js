/* Block is a Storage Container that stores transactions */
class Block {
  constructor(Height, BlockSize, BlockHeader, TxCount, Txs) {
    this.Height = Height;
    this.BlockSize = BlockSize;
    this.blockHeader = BlockHeader;
    this.TxCount = TxCount;
    this.Txs = Txs;
  }
}

module.exports = { Block };
