const connect = require("./dbtest");
const Block = require("./model/blockSchema");

const main = async (returnLast = false, filter = false, latestRecs = false) => {
  try {
    if (returnLast) {
      return await Block.find().sort({ _id: -1 }).limit(1);
    }

    if (filter) {
      // Create dynamic query to fetch data from database
      const query = {};
      query[Object.keys(filter)[0]] = Object.values(filter)[0];
      return Block.find(query);
    }

    if (latestRecs) {
      return await Block.find().sort({ _id: -1 }).limit(latestRecs);
    }
    // if no paramter is passed, return all data
    return Block.find();
  } catch (err) {
    console.log("Error while con", err);
  }
};

if (require.main === module) {
  main();
}

exports.main = main;
