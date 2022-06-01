import { useRouter } from "next/router";
import { generateAddress } from "../../Backend/util/util";
import Link from "next/link";

export default function UnconfimredTx() {
  const router = useRouter();
  const { Tx } = router.query;
  console.log(`Raw Tx: ${Tx}`);

  if (Tx) {
    const { version, tx_ins, tx_outs, TxId, locktime } = JSON.parse(Tx);
    console.log(JSON.parse(Tx));
    console.log(Tx);
    return (
      <>
        <div className="bg-black min-h-screen pt-[4em]">
          <div className="bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl mx-[5em] overflow-hidden ">
            <div className=" grid grid-cols-[30%_70%] text-white px-[6em]">
              <div className=" flex items-center col-span-2 h-[3em]  text-3xl font-bold pl-[1em]">
                Unconfirmed Transaction
              </div>
              {/* Block Field Names*/}
              <div className=" pl-[2em] pb-[4em] overflow-hidden">
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> Transaction Id </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> Status </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> Version </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> Locktime </h1>
                </div>
              </div>
              {/* Populate Block Data*/}
              <div className="overflow-hidden">
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> {TxId} </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> unconfirmed </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> {version} </h1>
                </div>
                <div className="flex items-center h-[3em] text-lg border-b-[1px]">
                  <h1> {locktime} </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="text-white pl-[2em] mt-[1em] text-4xl font-bold overflow-hidden">
            Transactions
          </div>
          <div
            key={TxId}
            className="text-white bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl mx-[5em]
        mt-[2em] min-h-[15em] grid grid-cols-2 overflow-hidden "
          >
            <div className="col-span-2 pl-[1.5em] mt-[2em] text-xl font-bold overflow-hidden">
              {TxId}
            </div>

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
                    <div className="pl-[0.3em]">
                      <Link
                        href={`/transaction/tx?TxId=${transaction.prev_tx.string}`}
                      >
                        <a className=" underline">
                          {transaction.prev_tx.string}
                        </a>
                      </Link>
                    </div>
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
                            transaction.scriptPubKey.cmds[2].string,
                            "hex"
                          )
                        )}`}
                      >
                        <a className="underline">
                          {generateAddress(
                            Buffer.from(
                              transaction.scriptPubKey.cmds[2].string,
                              "hex"
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
        </div>
      </>
    );
  }
}
