const { intToLittleEndian, encodeVarint } = require("../../util/util");
const { OP_CODE_FUNCTIONS } = require("./op");

class Script {
  constructor(cmds = null) {
    if (cmds === null) {
      this.cmds = [];
    } else {
      this.cmds = cmds;
    }
  }

  add(other) {
    return new Script(this.cmds.concat(other.cmds));
  }

  serialize() {
    const s = [];
    for (const cmd of this.cmds) {
      if (typeof cmd === "number") {
        s.push(intToLittleEndian(cmd, 1));
      } else {
        const length = cmd.length;
        if (length <= 75) {
          s.push(intToLittleEndian(length, 1));
        } else if (length > 75 && length < 0x100) {
          s.push(intToLittleEndian(76, 1));
          s.push(intToLittleEndian(length, 1));
        } else if (length >= 0x100 && length < 520) {
          s.push(intToLittleEndian(77, 1));
          s.push(intToLittleEndian(length, 2));
        } else {
          throw new Error("Too Long command");
        }
        s.push(cmd);
      }
    }
    try {
      let totalLength = 0;

      for (let i = 0; i < s.length; i++) {
        totalLength += s[i].length;
      }
      let temp = encodeVarint(totalLength);
      for (let i = 0; i < s.length; i++) {
        if (s[i] instanceof Buffer) {
          temp = Buffer.concat([temp, Buffer.from(s[i])]);
        } else {
          temp = Buffer.concat([temp, s[i]]);
        }
      }
      return temp;
    } catch (err) {
      console.log(err);
    }
  }

  evaluate(z) {
    const cmds = this.cmds;
    const stack = [];

    // while cmds.length > 0
    while (cmds.length > 0) {
      const cmd = cmds.splice(0, 1)[0];

      if (typeof cmd === "number") {
        const operation = OP_CODE_FUNCTIONS[cmd];

        if (cmd === 172) {
          if (!operation(stack, z)) {
            console.log("Error in Signature Verification");
            return false;
          }
        } else if (!operation(stack)) {
          print("Error in Signature Verification");
        }
      } else {
        stack.push(cmd);
      }
    }
    return true;
  }

  static p2pkhScript(pubKeyHash) {
    return new Script([0x76, 0xa9, pubKeyHash, 0x88, 0xac]);
  }
}

module.exports = { Script };
