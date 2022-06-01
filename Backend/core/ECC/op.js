const { Sha256Point, Signature } = require("./Elliptic");
const { hash160 } = require("../../util/util");

function op_dup(stack) {
  if (stack.length < 1) {
    return false;
  }

  stack.push(stack[stack.length - 1]);
  return true;
}

function op_hash160(stack) {
  if (stack.length < 1) {
    return false;
  }

  const buf = stack.pop();
  stack.push(hash160(buf));
  return true;
}

function op_equal(stack) {
  if (stack.length < 2) {
    return false;
  }

  const buf1 = stack.pop();
  const buf2 = stack.pop();
  stack.push(buf1.equals(buf2));
  return true;
}

function op_verify(stack) {
  if (stack.length < 1) {
    return false;
  }
  const element = stack.pop();
  if (element === 0) {
    return false;
  }
  return true;
}

function op_equalverify(stack) {
  return op_equal(stack) && op_verify(stack);
}

function op_checksig(stack, z) {
  if (stack.length < 1) {
    return false;
  }

  const secPubKey = stack.pop();
  const derSignature = stack.pop().slice(0, -1);
  let sig = "";
  let point = "";
  try {
    point = Sha256Point.parse(secPubKey);
    sig = Signature.parse(derSignature);
  } catch (e) {
    console.log(Error(e));
    return false;
  }

  if (point.verify(z, sig)) {
    console.log("verify success");
    return true;
  } else {
    stack.push(0);
    return false;
  }
}

OP_CODE_FUNCTIONS = {
  118: op_dup,
  136: op_equalverify,
  169: op_hash160,
  172: op_checksig,
};

module.exports = { OP_CODE_FUNCTIONS };
