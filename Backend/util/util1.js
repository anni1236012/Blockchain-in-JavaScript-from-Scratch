const crypto = require("crypto");

// Return hash256 for a given message
const hash256 = (message) => {
  return crypto.createHash("sha256").update(message).digest("hex");
};

module.exports = { hash256 };
