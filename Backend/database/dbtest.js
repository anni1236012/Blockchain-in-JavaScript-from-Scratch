require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      keepAlive: 1,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log("CONNECTED to MONGODB DATABASE");
    return mongoose;
  } catch (err) {
    console.error(err);
  }
};

if (require.main === module) {
  connectDB();
}

module.exports = connectDB;
