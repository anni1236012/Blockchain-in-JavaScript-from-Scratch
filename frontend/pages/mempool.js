import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Mempool() {
  const socketRef = useRef();
  const [unconfirmedTxs, setunconfirmedTxs] = useState(false);
  const COIN = 100000000;

  const mempoolTxs = Object.keys(unconfirmedTxs).map((TxId) => {
    const Tx = unconfirmedTxs[TxId];
    let Amount = 0;
    Tx.tx_outs.forEach((txOut) => {
      Amount += parseInt(txOut.amount);
    });
    return (
      <div
        key={Tx.TxId}
        className="cursor-pointer  grid grid-cols-[3fr_1fr] border-b-[1px] h-[4em] pt-[1em] hover:bg-gradient-to-r  from-purple-600 to-blue-400 rounded-2xl"
      >
        <Link
          href={{
            pathname: `/unconfirmedtx`,
            query: {
              Tx: JSON.stringify(Tx, (key, value) => {
                return value instanceof ArrayBuffer
                  ? {
                      type: ArrayBuffer,
                      string: Buffer.from(value).toString("hex"),
                    }
                  : value;
              }),
            },
          }}
        >
          <a>
            <div className="flex justify-start px-[2em]">{Tx.TxId}</div>
          </a>
        </Link>

        {/* <Link href={`/unconfirmedtx?Txid=${Tx.TxId} `} passHref>
          <a>
            <div className="flex justify-start px-[2em]">{Tx.TxId}</div>
            <UnconfimredTx props={Tx} />
          </a>
        </Link> */}

        <div className="flex justify-center"> {Amount / COIN} BTC </div>
      </div>
    );
  });

  useEffect(() => {
    socketRef.current = io("http://localhost:3600");
    socketRef.current.on("connect", () => {
      console.log("Connected Again", socketRef.current.id);
      socketRef.current.emit("SEND_MEMPOOL");
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    socketRef.current.on("connect", () => {
      socketRef.current.on("SEND_MEMPOOL", (data) => {
        setunconfirmedTxs(data);
        for (let TxId in data) {
          console.log(
            data[TxId].tx_outs[0].scriptPubKey.cmds[2].toString("hex")
          );
        }
      });
    });
  }, [unconfirmedTxs]);

  return (
    <>
      {Object.keys(unconfirmedTxs).length === 0 && (
        <div className="bg-black  pt-[2em] min-h-screen">
          <div
            className=" bg-gradient-to-r from-indigo-700 to-sky-600 rounded-2xl  text-white
          mx-[6em] py-[4em]   "
          >
            <div className="flex justify-center items-center text-5xl font-bold">
              Memory Pool
            </div>
            <div className="flex justify-center items-center text-3xl font-bold mt-[1em]">
              0 Transactions to Mine
            </div>
          </div>
        </div>
      )}
      {Object.keys(unconfirmedTxs).length > 0 && (
        <div className="bg-black flex justify-center pt-[2em] min-h-screen">
          <div className="w-full h-full bg-gradient-to-r from-indigo-700 to-sky-600 rounded-2xl  text-white grid grid-rows-[4em_1fr] mx-[6em]">
            <div className=" text-4xl font-bold pl-[1em] pt-[1em]">
              Unconfirmed Transactions
            </div>
            <div className="pt-[2em]">
              <div className="grid grid-cols-[3fr_1fr] font-bold h-[3em] text-xl border-b-2">
                <div className="flex justify-center pl-[4em]">
                  {" "}
                  Transaction Id{" "}
                </div>
                <div className="flex justify-center">Total BTC </div>
              </div>
            </div>
            <div> {mempoolTxs}</div>
          </div>
        </div>
      )}
    </>
  );
}
