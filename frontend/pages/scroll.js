import Link from "next/link";
import connect from "../../Backend/database/dbtest";
import { useEffect, useState, useRef, useCallback } from "react";
// import read from "../../Backend/database/read";
export default function Blocks({ data }) {
  const [blocks, setBlocks] = useState([]);

  const HeightRef = useRef();
  const isLoading = useRef(false);

  const MINUTE_MS = 500000;

  const loadNewBlocks = async () => {
    if (!isLoading.current) {
      isLoading.current = true;

      const res = await fetch(
        `http://localhost:3000/api/fetchBlocks?blockHeight=${HeightRef.current}`
      );
      const newBlocks = await res.json();

      HeightRef.current = newBlocks[newBlocks.length - 1].Height;
      setBlocks((prevBlocks) => [...prevBlocks, ...newBlocks]);
      // setBlocks((prevBlocks) => [...new Set([...prevBlocks, ...newBlocks])]);
      isLoading.current = false;
    }
  };

  const handleScroll = async (e) => {
    if (
      e.target.documentElement.scrollTop + window.innerHeight >=
      e.target.documentElement.scrollHeight
    ) {
      await loadNewBlocks();
    }
  };

  useEffect(() => {
    setBlocks(data);
    HeightRef.current = data[data.length - 1].Height;
    window.addEventListener("scroll", handleScroll);
    return () => {
      console.log("Listeners removed");
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      loadNewBlocks();
    }, MINUTE_MS);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, []);

  return (
    <div className="bg-black flex justify-center pt-[2em]">
      <div className="w-full h-full bg-gradient-to-r from-indigo-700 to-sky-600 rounded-2xl  text-white grid grid-rows-[4em_1fr] mx-[6em]">
        <div className=" text-4xl font-bold pl-[1em] pt-[1em]">
          Latest Blocks
        </div>
        <div className="pt-[2em]">
          <div className="grid grid-cols-[1fr_3fr_1fr_1fr] font-bold h-[3em] text-xl border-b-2">
            <div className="flex justify-center"> Block Height </div>
            <div className="flex justify-center">Block Header</div>
            <div className="flex justify-center"> Transactions </div>
            <div className="flex justify-center"> Block Size </div>
          </div>
          {blocks.map((block) => (
            <div
              onScroll={handleScroll}
              key={block.blockHeader.blockhash}
              className="cursor-pointer grid grid-cols-[1fr_3fr_1fr_1fr] border-b-[1px] h-[4em] pt-[1em] hover:bg-gradient-to-r  from-purple-600 to-blue-400 rounded-2xl"
            >
              <div className="flex justify-center"> {block.Height} </div>
              <div className=" ">
                <Link href={`/block?blockhash=` + block.blockHeader.blockhash}>
                  <div className="flex justify-start px-[2em]">
                    {block.blockHeader.blockhash}
                  </div>
                </Link>
              </div>
              <div className="flex justify-center"> {block.TxCount} </div>
              <div className="flex justify-center"> {block.BlockSize} </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const connection = await connect();
  // const blocks = JSON.parse(JSON.stringify(await read.main(false, false, 20)));
  const res = await fetch("http://localhost:3000/api/fetchBlocks");
  const data = await res.json();

  return {
    props: { data },
  };
}
