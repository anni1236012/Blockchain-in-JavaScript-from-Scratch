// Codies Alert reverses all the rights for this library
// This package should not be used for commercial purposes wihout codiesAlert's permission

const { bigIntToBuffer, bufferToBigInt } = require("../../util/util");
const { createHmac } = require("crypto");
// ECC Constants
const A = 0n;
const B = 7n;
const P = 2n ** 256n - 2n ** 32n - 977n;
const N = 0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

class FiniteField {
  constructor(_num, _prime) {
    if (_num >= _prime || _num < 0n) {
      throw `Num ${_num} not in field range 0 to ${_prime - 1n}`;
    }
    this.num = _num;
    this.prime = _prime;
  }

  // Javascript modulo is not working for negative numbers
  // Below function is created to fix this issue
  mod(n, m) {
    return ((n % m) + m) % m;
  }

  // BigInt ** does not work for exponentiation because i goes out of range
  // Below function is created to fix this issue
  powerMod(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    var result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n)
        //odd number
        result = (result * base) % modulus;
      exponent = exponent >> 1n; //divide by 2
      base = (base * base) % modulus;
    }
    return result;
  }

  equal(other) {
    if (!other) {
      return false;
    }

    return this.num === other.num && this.prime === other.prime;
  }

  notEqual(other) {
    return !this.equal(other);
  }

  add(other) {
    if (this.prime !== other.prime) {
      throw `Cannot add two elements of different fields`;
    }
    const num = (this.num + other.num) % this.prime;
    return new this.constructor(num, this.prime);
  }

  sub(other) {
    if (this.prime !== other.prime) {
      throw `Cannot subtract two elements of different fields`;
    }
    const num = this.mod(this.num - other.num, this.prime);
    return new this.constructor(num, this.prime);
  }

  mul(other) {
    if (this.prime !== other.prime) {
      throw `Cannot multiply two elements of different fields`;
    }
    const num = (this.num * other.num) % this.prime;
    return new this.constructor(num, this.prime);
  }

  pow(exponent) {
    const n = exponent % (this.prime - 1n);
    const num = this.powerMod(this.num, n, this.prime);

    return new this.constructor(num, this.prime);
  }

  div(other) {
    if (this.prime !== other.prime) {
      throw `Cannot divide two elements of different fields`;
    }
    const num =
      (this.num * this.powerMod(other.num, this.prime - 2n, this.prime)) %
      this.prime;

    return new this.constructor(num, this.prime);
  }

  // Scalar multiplication
  rmul(coefficient) {
    const num = (this.num * coefficient) % this.prime;
    return new this.constructor(num, this.prime);
  }
}

class point {
  constructor(x, y, a, b) {
    this.x = x;
    this.y = y;
    this.a = a;
    this.b = b;

    if (!this.x & !this.y) {
      return;
    }

    // this.y ** 2 != this.x ** 3 + a * x + b

    if (
      this.y
        .pow(2n)
        .notEqual(this.x.pow(3n).add(this.a.mul(this.x)).add(this.b))
    ) {
      throw new Error(`${this.x.num}, ${this.y.num} is not on the curve.`);
    }
  }

  equal(other) {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.a === other.a &&
      this.b === other.b
    );
  }

  notEqual(other) {
    return !this.equal(other);
  }

  add(other) {
    if (this.a.notEqual(other.a) || this.b.notEqual(other.b)) {
      throw new Error(`Points ${this} and ${other} are not on the same curve.`);
    }

    if (!this.x) {
      return other;
    }

    if (!other.x) {
      return this;
    }
    // Case 1 : this == other and this.y != other.y
    // Result is Point at infinity

    if (this.x.equal(other.x) && this.y.notEqual(other.y)) {
      return new this.constructor(null, null, this.a, this.b);
      // return new point(null, null, this.a, this.b);
    }

    // Case 2: this.x != other.x
    // Formula (x3, y3) === (x1, y1) + (x2, y2)
    // s = (y2 - y1) / (x2 - x1)
    // x3 = s**2 - x1 - x2
    // y3 = s * (x1 - x3) - y1

    if (this.x.notEqual(other.x)) {
      const s = other.y.sub(this.y).div(other.x.sub(this.x));
      const x = s.pow(2n).sub(this.x).sub(other.x);
      const y = s.mul(this.x.sub(x)).sub(this.y);
      return new this.constructor(x, y, this.a, this.b);
    }

    // Case 4: if we are tanget to the verticle line
    // we return the point at infinity
    // instead of figuring out what 0 is for each type
    // we just use 0 * this.x
    if (this.equal(other) && this.y.equal(this.x.rmul(0n))) {
      return new this.constructor(null, null, this.a, this.b);
    }

    // Case 3: this == other
    // Formula (x3, y3) === (x1, y1) + (x1, y1)
    // s = (3 * x1**2 + a) / (2 * y1)
    // x3 = s**2 - 2 * x1
    // y3 = s * (x1 - x3) - y1
    if (this.equal(other)) {
      const s = this.x.pow(2n).rmul(3n).add(this.a).div(this.y.rmul(2n));
      const x = s.pow(2n).sub(this.x.rmul(2n));
      const y = s.mul(this.x.sub(x)).sub(this.y);
      return new this.constructor(x, y, this.a, this.b);
    }
  }

  pointRmul(coefficient) {
    let coef = coefficient;
    let current = this;
    let result = new this.constructor(null, null, this.a, this.b);

    while (coef) {
      if (coef & 1n) {
        result = result.add(current);
      }
      current = current.add(current);
      coef >>= 1n;
    }
    return result;
  }
}

class Sha256Field extends FiniteField {
  constructor(num, prime = null) {
    super((num = num), (prime = P));
  }

  sqrt() {
    return this.pow((P + 1n) / 4n);
  }
}

class Sha256Point extends point {
  constructor(x, y, a = null, b = null) {
    a = new Sha256Field(A);
    b = new Sha256Field(B);

    if (typeof x === "bigint") {
      super((x = new Sha256Field(x)), (y = new Sha256Field(y)), a, b);
    } else {
      super(x, y, a, b);
    }
  }

  rmul(coefficient) {
    const coef = coefficient % N;
    return super.pointRmul(coef);
  }

  powerMod(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    var result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n)
        //odd number
        result = (result * base) % modulus;
      exponent = exponent >> 1n; //divide by 2
      base = (base * base) % modulus;
    }
    return result;
  }

  verify(z, sig) {
    const s_inv = this.powerMod(sig.s, N - 2n, N);
    // const s_inv = pow(sig.s, N - 2n) % N;
    const u = (z * s_inv) % N;
    const v = (sig.r * s_inv) % N;

    const uRes = G.rmul(u);
    const vRes = this.rmul(v);
    const total = uRes.add(vRes);
    return total.x.num === sig.r;
  }

  sec(compressed = true) {
    if (compressed) {
      if (this.y.num % 2n === 0n) {
        return Buffer.concat([Buffer.from([0x02]), bigIntToBuffer(this.x.num)]);
      } else {
        return Buffer.concat([Buffer.from([0x03]), bigIntToBuffer(this.x.num)]);
      }
    } else {
      return Buffer.concat([
        Buffer.from([0x04]),
        bigIntToBuffer(this.x.num),
        bigIntToBuffer(this.y.num),
      ]);
    }
  }

  static parse(sec_bin) {
    if (sec_bin[0] === 0x04) {
      const x = bufferToBigInt(sec_bin.slice(1, 33));
      const y = bufferToBigInt(sec_bin.slice(33, 65));
      return new Sha256Point(x, y);
    }

    const is_even = sec_bin[0] === 0x02;
    const x = new Sha256Field(bufferToBigInt(sec_bin.slice(1)));

    const alpha = x.pow(3n).add(new Sha256Field(B));

    const beta = alpha.sqrt();

    let even_beta = "";
    let odd_beta = "";
    if (beta.num % 2n === 0n) {
      even_beta = beta;
      odd_beta = new Sha256Field(P - beta.num);
    } else {
      even_beta = new Sha256Field(P - beta.num);
      odd_beta = beta;
    }

    if (is_even) {
      return new Sha256Point(x, even_beta);
    } else {
      return new Sha256Point(x, odd_beta);
    }
  }
}

class Signature {
  constructor(r, s) {
    this.r = r;
    this.s = s;
  }

  der() {
    let rbin = bigIntToBuffer(this.r, 32);
    // remove all leading 0's
    while (rbin[0] === 0) {
      rbin = rbin.slice(1);
    }
    if (rbin[0] & 0x80) {
      rbin = Buffer.concat([Buffer.from([0x00]), rbin]);
    }

    let result = Buffer.concat([
      Buffer.from([0x02]),
      Buffer.from([rbin.length]),
      rbin,
    ]);
    let sbin = bigIntToBuffer(this.s, 32);
    // remove all leading 0's
    while (sbin[0] === 0) {
      sbin = sbin.slice(1);
    }
    if (sbin[0] & 0x80) {
      sbin = Buffer.concat([Buffer.from([0x00]), sbin]);
    }

    result = Buffer.concat([
      result,
      Buffer.from([0x02]),
      Buffer.from([sbin.length]),
      sbin,
    ]);

    return Buffer.concat([
      Buffer.from([0x30]),
      Buffer.from([result.length]),
      result,
    ]);
  }

  static parse(signature_bin) {
    let s = Buffer.from(signature_bin);
    const compound = s.slice(0, 1);
    if (compound[0] !== 0x30) {
      throw new Error("Invalid signature");
    }
    const length = s.slice(1, 2);
    if (length[0] + 2 !== s.length) {
      throw new Error("Invalid signature");
    }

    let marker = s.slice(2, 3);
    if (marker[0] !== 0x02) {
      throw new Error("Invalid signature");
    }

    const rlength = s.slice(3, 4);
    const r = bufferToBigInt(s.slice(4, 4 + rlength[0]));
    marker = s.slice(4 + rlength[0], 4 + rlength[0] + 1);

    if (marker[0] !== 0x02) {
      throw new Error("Invalid signature");
    }

    const slength = s.slice(5 + rlength[0], 6 + rlength[0]);
    s = bufferToBigInt(s.slice(6 + rlength[0], 6 + rlength[0] + slength[0]));

    if (signature_bin.length !== 6 + rlength[0] + slength[0]) {
      throw new Error("Invalid signature");
    }
    return new Signature(r, s);
  }
}

// Generator point for secp256k1
const G = new Sha256Point(
  0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,
  0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n
);

class PrivateKey {
  constructor(secret) {
    this.secret = secret;
    this.point = G.rmul(secret);
  }

  deterministic_k(z) {
    let k = Buffer.from("\x00".repeat(32));
    let v = Buffer.from("\x01".repeat(32));

    if (z > N) {
      z -= N;
    }

    const z_bytes = bigIntToBuffer(z, 32);
    const secret_bytes = bigIntToBuffer(this.secret, 32);

    k = createHmac("sha256", k)
      .update(Buffer.concat([v, Buffer.from([0x00]), secret_bytes, z_bytes]))
      .digest();

    v = createHmac("sha256", k).update(v).digest();
    k = createHmac("sha256", k)
      .update(Buffer.concat([v, Buffer.from([0x01]), secret_bytes, z_bytes]))
      .digest();

    v = createHmac("sha256", k).update(v).digest();

    while (true) {
      v = createHmac("sha256", k).update(v).digest();
      const candidate = bufferToBigInt(v);
      if (candidate >= 1 && candidate < N) {
        return candidate;
      }
      k = createHmac("sha256", k)
        .update(Buffer.concat(v, [0x00]))
        .digest();
      v = createHmac("sha256", k).update(v).digest();
    }
  }

  powerMod(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    var result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n)
        //odd number
        result = (result * base) % modulus;
      exponent = exponent >> 1n; //divide by 2
      base = (base * base) % modulus;
    }
    return result;
  }
  sign(z) {
    const k = this.deterministic_k(z);
    const r = G.rmul(k).x.num;
    // bigint exponentiation
    const k_inv = this.powerMod(k, N - 2n, N);
    let s = ((z + r * this.secret) * k_inv) % N;
    if (s > N / 2n) {
      s = N - s;
    }
    return new Signature(r, s);
  }
}

module.exports = {
  FiniteField,
  point,
  Sha256Field,
  Sha256Point,
  Signature,
  PrivateKey,
};
