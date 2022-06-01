const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

console.log("Worker Started");

let count = 0;
// for loop to count to 1 Billion
for (let i = 0; i < 50000000000; i++) {
  count++;
}

parentPort.postMessage({ count });
