const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
export default async function Heavy(req, res) {
  const worker = new Worker("./Pages/api/worker.js");

  async function heavyWork() {
    worker.on("message1", (data) => {
      res.status(200).json({ count: data.count });
      return true;
    });
  }

  await heavyWork();
}
