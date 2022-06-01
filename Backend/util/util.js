const { createHash } = require("crypto");
const bs58 = require("bs58");

// Two Rounds of sha256 hash
function sha256Double(data) {
  return createHash("sha256")
    .update(createHash("sha256").update(data).digest())
    .digest();
}

const hash256 = (message) => {
  return createHash("sha256").update(message).digest("hex");
};

const hash160 = (msg) => {
  const sha256 = createHash("sha256").update(msg).digest();
  const PubKeyHash = createHash("ripemd160").update(sha256).digest();
  return PubKeyHash;
};

// Base58 encode
function base58Encode(data) {
  return bs58.encode(data);
}

// Base58 decode
function base58Decode(data) {
  const PublicKeyHashWithCheckSum = bs58.decode(data);
  // Exclude the first byte because it is 0x00 Mainnet Prefix
  // Also Remove the last 4 bytes because they are the checksum
  return Buffer.from(PublicKeyHashWithCheckSum.slice(1, -4)).toString("hex");
}

// generate Address from PublicKeyHas
function generateAddress(publicKeyHash) {
  const prefix = Buffer.from([0x00]);
  const publicKeyHashWithCheckSum = Buffer.concat([prefix, publicKeyHash]);
  const checkSum = sha256Double(publicKeyHashWithCheckSum).slice(0, 4);
  const publicKeyHashWithCheckSumAndCheckSum = Buffer.concat([
    publicKeyHashWithCheckSum,
    checkSum,
  ]);
  return base58Encode(publicKeyHashWithCheckSumAndCheckSum);
}

// Create merkle root
function createMerkleRoot(transactions) {
  let merkleTree = [];
  for (const tx of transactions) {
    merkleTree.push(Buffer.from(tx.TxId, "hex").reverse());
  }
  while (merkleTree.length > 1) {
    const nextTree = [];
    if (merkleTree.length % 2 === 1) {
      merkleTree.push(merkleTree[merkleTree.length - 1]);
    }
    for (let i = 0; i < merkleTree.length; i += 2) {
      const left = merkleTree[i];
      const right = merkleTree[i + 1];
      const data = Buffer.concat([left, right]);
      const hash = sha256Double(data);
      nextTree.push(hash);
    }

    merkleTree = nextTree;
  }
  return merkleTree[0].reverse().toString("hex");
}

function bytesNeeded(n) {
  if (n === 0) {
    return 1;
  }
  return parseInt(Math.log(parseInt(n)) / Math.log(256) + 1);
}

// bigIntToLittleEndian
function intToLittleEndian(num, byteSize) {
  return bigIntToBuffer(num, byteSize).reverse();
}

// littleEndianToInt
function littleEndianToInt(buf) {
  return bufferToBigInt(buf.reverse());
}

function bits_to_target(bits) {
  const exp = bits.slice(-1);
  const mantissa = bits.slice(0, -1);
  const coff = littleEndianToInt(mantissa);
  return coff * 256n ** (BigInt(exp[0]) - 3n);
}

// target to bits
function target_to_bits(target) {
  let rawBytes = bigIntToBuffer(target, 32);
  // remove leading zeros
  while (rawBytes[0] === 0) {
    rawBytes = rawBytes.slice(1);
  }
  let exponent = "";
  let coefficient = "";
  if (rawBytes[0] > 0x7f) {
    exponent = rawBytes.length + 1;
    coefficient = Buffer.concat([Buffer.from([0x00]), rawBytes.slice(0, 2)]);
  } else {
    exponent = rawBytes.length;
    coefficient = rawBytes.slice(0, 3);
  }
  const newBits = Buffer.concat([
    coefficient.reverse(),
    Buffer.from([exponent]),
  ]);
  return newBits;
}

// Big int to Buffer in Big Endian Notation
// function bigIntToBuffer(bn, byteSize = null) {
//   var hex = BigInt(bn).toString(16);

//   if (hex.length % 2) {
//     hex = "0" + hex;
//   }

//   if (byteSize) {
//     const zeroPadding = "0".repeat(byteSize * 2 - hex.length);
//     hex = zeroPadding + hex;
//   }

//   var len = hex.length / 2;
//   var u8 = new Uint8Array(len);

//   var i = 0;
//   var j = 0;
//   while (i < len) {
//     u8[i] = hex.slice(j, j + 2);
//     // u8[i] = parseInt(hex.slice(j, j + 2), 16);
//     i += 1;
//     j += 2;
//   }

//   return u8;
// }

// function bufferToHex(num, byteSize = null) {
//   if (byteSize === null) {
//     return Buffer.from(num.toString(16));
//   }
// }

function bigIntToBuffer(bn, byteSize = null) {
  if (byteSize === null) {
    const buf = Buffer.from(bn.toString(16), "hex");
    return buf;
  } else {
    let zeroPadding = byteSize - bytesNeeded(bn);
    let zeroString;

    if (bn.toString(16).length % 2) {
      bn = "0" + bn.toString(16);
    }

    if (zeroPadding > 0) {
      zeroString = "0".repeat(zeroPadding * 2);
      return Buffer.from(zeroString + bn.toString(16), "hex");
    } else {
      return Buffer.from(bn.toString(16), "hex");
    }
  }
}

function bufferToBigInt(buf) {
  // do it to get the right values
  // var hex = buf.toString("hex");
  // var bigInt = BigInt('0x' + hex);
  if (!buf instanceof Buffer) {
    console.log(
      "Value is convered from Binary, check your type if value does not match"
    );
    return Buffer.from(buf.toString("binary"));
  }
  return BigInt("0x" + buf.toString("hex"));
}

// Buffer to Big int
// function bufferToBigInt(buf) {
//   var hex = [];
//   u8 = Uint8Array.from(buf);

//   u8.forEach(function (i) {
//     var h = i.toString(16);
//     if (h.length % 2) {
//       h = "0" + h;
//     }
//     hex.push(h);
//   });

//   return BigInt("0x" + hex.join(""));
// }

// Bytes to Big Endian
// function bytesToBigEndian(buf) {
//   return buf.readUIntBE(0, buf.length);
// }

//encodeVarint
function encodeVarint(i) {
  if (i < 0xfd) {
    // 0xfd is the largest number that can be encoded
    return Buffer.from([i]);
  } else if (i < 0x10000) {
    // convert 0xfd to Buffer to concatenate
    return Buffer.from([Buffer.from[0xfd], intToLittleEndian(i, 2)]);
  } else if (i < 0x100000000) {
    return Buffer.from([Buffer.from[0xfe], intToLittleEndian(i, 4)]);
  } else if (i < 0x10000000000000000) {
    return Buffer.from([Buffer.from[0xff], intToLittleEndian(i, 8)]);
  } else {
    throw new Error("Number too big");
  }
}

module.exports = {
  sha256Double,
  base58Encode,
  base58Decode,
  intToLittleEndian,
  littleEndianToInt,
  bytesNeeded,
  encodeVarint,
  bigIntToBuffer,
  bufferToBigInt,
  hash256,
  hash160,
  generateAddress,
  createMerkleRoot,
  bits_to_target,
  target_to_bits,
};
