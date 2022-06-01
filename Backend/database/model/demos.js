const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema({
  email: String,
  userName: String,
});

module.exports = mongoose.model("users", userSchema);
