import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import read from "../../../Backend/database/read";
import connect from "../../../Backend/database/dbtest";
import { generateAddress } from "../../../Backend/util/util";
export default function Block({ block }) {
  const { Height, BlockSize, TxCount, Transactions } = block[0];
  const { bits, timestamp, nonce, merkleroot, prevBlockHash } =
    block[0].blockHeader;
  const router = useRouter();

  const { blockhash } = router.query;

  return (
    <div className="bg-black min-h-screen pt-[4em]">
      <div className="bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl mx-[5em] overflow-hidden ">
        <div className=" grid grid-cols-[30%_70%] text-white px-[6em]">
          {/* Populate Block Numner*/}
          <div className=" flex items-center col-span-2 h-[3em]  text-3xl font-bold pl-[1em]">
            Block #{Height}
          </div>
          {/* Block Header*/}

          <div className="flex items-center col-span-2 h-[3em] ml-[1.2em] text-2xl font-bold border-b-[1px] ">
            {blockhash}
          </div>

          {/* Block Field Names*/}
          <div className=" pl-[2em] pb-[4em] overflow-hidden">
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Previous Block Hash </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Merkle Root </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Timestamp </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Nonce </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Number of Transactions </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Bits </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> Blocksize </h1>
            </div>
          </div>
          {/* Populate Block Data*/}
          <div className="overflow-hidden">
            <Link href={`/blocks/block?blockhash=` + prevBlockHash} passHref>
              <div className="flex items-center h-[3em] text-lg border-b-[1px] cursor-pointer underline">
                <h1> {prevBlockHash} </h1>
              </div>
            </Link>

            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> {merkleroot} </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> {timestamp} </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> {nonce} </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> {TxCount} </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> {bits} </h1>
            </div>
            <div className="flex items-center h-[3em] text-lg border-b-[1px]">
              <h1> {BlockSize} </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="text-white pl-[2em] mt-[1em] text-4xl font-bold overflow-hidden">
        Transactions
      </div>
      {Transactions.map((txs, index) => {
        return (
          <div
            key={txs.TxId}
            className="text-white bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl mx-[5em] 
      mt-[2em] min-h-[15em] grid grid-cols-2 overflow-hidden "
          >
            <div className="col-span-2 pl-[1.5em] mt-[2em] text-xl font-bold overflow-hidden">
              {txs.TxId}
            </div>
            <div className="font-bold text-2xl pl-[1em] my-[1em] self-start overflow-hidden">
              Inputs
            </div>
            <div className="font-bold text-2xl pl-[1em] my-[1em] overflow-hidden">
              Outputs
            </div>

            <div>
              {txs.tx_ins.map((transaction, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center pl-[1em] bg-gradient-to-r from-blue-400 to-teal-400 h-20 mx-[1em] rounded-2xl p-[1em] mb-[1em]
                    overflow-hidden"
                  >
                    #{index}
                    <div className="pl-[0.3em]">
                      {Buffer.from(transaction.prev_tx.data).toString("hex") ===
                        "0".repeat(64) && "Coinbase"}
                      {Buffer.from(transaction.prev_tx.data).toString("hex") !==
                        "0".repeat(64) && (
                        <Link
                          href={`/transaction/tx?TxId=${Buffer.from(
                            transaction.prev_tx
                          ).toString("hex")}`}
                        >
                          <a className=" underline">
                            {Buffer.from(transaction.prev_tx).toString("hex")}
                          </a>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              {txs.tx_outs.map((transaction, index) => {
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
        );
      })}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { blockhash } = context.query;
  const filter = { "blockHeader.blockhash": blockhash };
  const connection = await connect();
  const block = JSON.parse(JSON.stringify(await read.main(false, filter)));
  console.log("block", block);
  return {
    props: { block },
  };
}
