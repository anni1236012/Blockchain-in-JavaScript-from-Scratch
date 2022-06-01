const Block = require("../../../Backend/database/model/blockSchema");
import connect from "../../../Backend/database/dbtest";

let connection = {};
export default async function fetchBlocks(req, res) {
  const PAGE_SIZE = 20;
  const currentBlock = req.query.blockHeight
    ? parseInt(req.query.blockHeight)
    : PAGE_SIZE;

  const latest = req.query.latest;

  if (currentBlock === 20 || latest === "1") {
    res.status(200).json(
      await Block.find({ Height: { $gt: currentBlock } })
        .sort({ _id: -1 })
        .limit(PAGE_SIZE)
    );
  } else {
    res.status(200).json(
      await Block.find({ Height: { $lt: currentBlock } })
        .sort({ _id: -1 })
        .limit(PAGE_SIZE)
    );
  }
}
