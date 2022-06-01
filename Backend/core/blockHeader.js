const { hash256 } = require("../util/util.js");
const {
  intToLittleEndian,
  littleEndianToInt,
  sha256Double,
} = require("../util/util");

const MAX_NONCE = 2n ** 32n;

class BlockHeader {
  constructor(version, prevBlockhash, merkleRoot, timestamp, bits) {
    this.version = version;
    this.prevBlockhash = prevBlockhash;
    this.timestamp = timestamp;
    this.merkleRoot = merkleRoot;
    this.bits = bits;
    this.nonce = 0;
    this.blockhash = "";
  }

  mine(target) {
    while (this.nonce < MAX_NONCE) {
      // Generate Block Hashes by changing the Nonce Value
      this.blockhash = littleEndianToInt(
        sha256Double(
          Buffer.concat([
            intToLittleEndian(this.version, 4),
            Buffer.from(this.prevBlockhash, "hex"),
            Buffer.from(this.merkleRoot, "hex"),
            intToLittleEndian(this.timestamp, 4),
            this.bits,
            intToLittleEndian(this.nonce, 4),
          ])
        )
      );

      if (this.blockhash < target) {
        this.blockhash = intToLittleEndian(this.blockhash, 32)
          .toString("hex")
          .split("")
          .reverse()
          .join("");

        return;
      }

      // Increment the Nonce Value
      this.nonce += 1;

      process.stdout.write(
        `Mining Started ${this.nonce} and Hash Value is ${this.blockhash} \r`
      );
    }
  }
}

// Execute only if it is called from the same file
// This won't get executed when imported in another file
if (require.main === module) {
  const blockheader = new BlockHeader(1, 1, Date.now(), 1);
  blockheader.mine();
}

module.exports = { BlockHeader };
