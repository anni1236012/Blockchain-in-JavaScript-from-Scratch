import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { generateAddress, base58Decode } from "../../../Backend/util/util";
export default function Account() {
  const router = useRouter();
  const { account } = router.query;
  const COIN = 100000000;
  const [accountHash, setAccountHash] = useState(null);
  const [Txs, setTxs] = useState(null);
  const [AccountBalance, setAccountBalance] = useState(0);
  const [TotalCount, setTotalCount] = useState(0);

  useEffect(() => {
    (async () => {
      console.log(`Raw Tx: ${account}`);

      if (account !== undefined) {
        setAccountHash(base58Decode(account));
        const res = await fetch(
          `http://localhost:3000/api/fetchAccount?account=${account}`
        );
        const { data, Accountbal, TxCount } = await res.json();
        setTxs(data);
        setAccountBalance(Accountbal / COIN);
        setTotalCount(TxCount);
      }
    })();
  }, [account]);

  if (Txs) {
    return (
      <>
        <div className="bg-black min-h-screen pt-[4em]">
          <div className="bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl mx-[5em] overflow-hidden ">
            <div className=" grid grid-cols-[30%_70%] text-white px-[6em]">
              <div className=" flex items-center col-span-2 h-[3em]  text-2xl font-bold pl-[1em]">
                {account}
              </div>
              {/* Block Field Names*/}
              <div className=" pl-[2em] pb-[4em] overflow-hidden">
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> Total Balance </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> No. of Transactions </h1>
                </div>
              </div>
              {/* Populate Block Data*/}
              <div className="overflow-hidden">
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> {AccountBalance} BTC </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> {TotalCount} </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="text-white pl-[2em] mt-[1em] text-4xl font-bold overflow-hidden">
            Transactions History
          </div>

          {Txs.map((tx) => {
            const { tx_ins, tx_outs } = tx;

            return (
              <>
                <div
                  key={tx.TxId}
                  className="text-white bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl mx-[5em]
          mt-[2em] min-h-[15em] grid grid-cols-2 overflow-hidden "
                >
                  <div className="font-bold text-2xl pl-[1em] my-[1em] self-start overflow-hidden">
                    Inputs
                  </div>
                  <div className="font-bold text-2xl pl-[1em] my-[1em] overflow-hidden">
                    Outputs
                  </div>
                  <div>
                    {tx_ins.map((transaction, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center pl-[1em] bg-gradient-to-r from-blue-400 to-teal-400 h-20 mx-[1em] rounded-2xl p-[1em] mb-[1em]
                        overflow-hidden"
                        >
                          #{index}
                          {Buffer.from(transaction.prev_tx.data).toString(
                            "hex"
                          ) === "0".repeat(64) && (
                            <div className="pl-[0.3em]">COINBASE</div>
                          )}
                          {Buffer.from(transaction.prev_tx.data).toString(
                            "hex"
                          ) !== "0".repeat(64) && (
                            <div className="pl-[0.3em]">
                              <Link
                                href={`/transaction/tx?TxId=${Buffer.from(
                                  transaction.prev_tx
                                ).toString("hex")}`}
                              >
                                <a className=" underline">
                                  {Buffer.from(transaction.prev_tx).toString(
                                    "hex"
                                  )}
                                </a>
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    {tx_outs.map((transaction, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center pl-[1em] bg-gradient-to-r from-teal-400 to-blue-400 h-20 mx-[1em] rounded-2xl  mb-[1em]
                        overflow-hidden  "
                        >
                          #{index}
                          <div className="pl-[0.5em]">
                            <Link
                              href={`/myaccount/acct?account=${generateAddress(
                                Buffer.from(
                                  transaction.scriptPubKey.cmds[2],
                                  "base64"
                                )
                              )}`}
                            >
                              <a className="underline">
                                {generateAddress(
                                  Buffer.from(
                                    transaction.scriptPubKey.cmds[2],
                                    "base64"
                                  )
                                )}
                              </a>
                            </Link>
                          </div>
                          <div className="pl-[0.2em]">
                            : {transaction.amount / 100000000} BTC
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </>
    );
  }
}
