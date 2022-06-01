// This Package is just for Testing and learning purpose

const { Sha256Point } = require("./ECC/Elliptic");
const { randomBytes, createHash } = require("crypto");
const { sha256Double, base58Encode, bigIntToBuffer } = require("../util/util");

class CreateKeys {
  constructor(privateKey) {
    if (typeof privateKey === "number") {
      this.privateKey = BigInt(privateKey);
    } else {
      this.privateKey = privateKey;
    }
  }
  // generate privKey
  getPrivateKey() {
    while (true) {
      const privKey = randomBytes(32);
      return privKey;
    }
  }

  createPublicKey() {
    // Gx and Gy are the x and y coordinates of the generator point of the secp256k1 curve
    const Gx =
      0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
    const Gy =
      0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;

    // Get Uncompressed Public Key by multiplying G to the private key
    const G = new Sha256Point(Gx, Gy);

    if (!this.privateKey) {
      this.privateKey = BigInt("0x" + this.getPrivateKey().toString("hex"));
    }

    const uncompressedPublicKey = G.rmul(this.privateKey);

    // convert uncompressed public key to compressed public key
    let compressedPublicKey = "";
    if (uncompressedPublicKey.y.num % 2n === 0n) {
      compressedPublicKey = Buffer.concat([
        Buffer.from([0x02]),
        bigIntToBuffer(uncompressedPublicKey.x.num),
      ]);
      // compressedPublicKey = "02" + uncompressedPublicKey.x.num.toString(16);
    } else {
      compressedPublicKey = Buffer.concat([
        Buffer.from([0x03]),
        bigIntToBuffer(uncompressedPublicKey.x.num),
      ]);
      // compressedPublicKey = "03" + uncompressedPublicKey.x.num.toString(16);
    }

    // Calculate hash160
    // compressedPublicKey = Buffer.from(compressedPublicKey, "hex");
    const sha256 = createHash("sha256").update(compressedPublicKey).digest();
    const PubKeyHash = createHash("ripemd160").update(sha256).digest();

    // Add Mainnet Prefix
    const PubKeyHashWithMainnetPrefix = Buffer.concat([
      Buffer.from([0x00]),
      PubKeyHash,
    ]);

    // Calculate Checksum by excluding the last 4 bytes
    const checksum = sha256Double(PubKeyHashWithMainnetPrefix).slice(0, 4);
    const PubKeyHashWithMainnetPrefixAndChecksum = Buffer.concat([
      PubKeyHashWithMainnetPrefix,
      checksum,
    ]);

    // Get Public Address by Base58 encoding
    const Publicaddress = base58Encode(PubKeyHashWithMainnetPrefixAndChecksum);
    console.log(
      `Private Key ${this.privateKey} \nPublic Key Hash :${PubKeyHash.toString(
        "hex"
      )}\nPublic Address: ${Publicaddress}`
    );
    return Publicaddress;
  }
}

if (require.main === module) {
  const createKeys = new CreateKeys();
  createKeys.createPublicKey();
}

module.exports = CreateKeys;
