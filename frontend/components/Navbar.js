import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
export default function Navbar() {
  const router = useRouter();
  return (
    <nav
      className={`flex justify-evenly items-center z-50 text-white pt-[1em] ${
        router.pathname.length !== 1 && "bg-black"
      }  text-white`}
    >
      <div className="basis-[60%] flex items-center justify-center">
        <div className=" cursor-pointer">
          <Link href="/" passHref>
            <Image
              src="/logo.png"
              height={70}
              width={70}
              alt="Codies Alert Logo"
            />
          </Link>
        </div>
        <div className="pl-[2em]">
          <Link href="/">
            <a className="pr-[2.5em]"> Home </a>
          </Link>
          <Link href="/blocks">
            <a className="pr-[2.5em]"> Blocks </a>
          </Link>
          <Link href="/sendBTC">
            <a className="pr-[2.5em]"> Transfer </a>
          </Link>
          <Link href="/mempool">
            <a className="pr-[2.5em]"> Mempool </a>
          </Link>
        </div>
      </div>

      {/* <div className="basis-[20%] flex justify-evenly">
        <button className="bg-gradient-to-r from-pink-400 to-purple-600 rounded-full px-[1em] h-[2.5em]">
          Sign in
        </button>
        <button className="bg-gradient-to-r from-pink-400 to-purple-600 rounded-full px-[1em] h-[2.5em]">
          Sign Out
        </button>
      </div> */}

      <div className="basis-[20%] flex justify-evenly">
        <button className="bg-blue-700 px-[1em] py-[0.5em] rounded-full font-bold">
          F
        </button>
        <button className=" bg-sky-400 px-[1em] py-[0.5em] rounded-full font-bold">
          T
        </button>
        <button className="bg-pink-400 px-[1em] py-[0.5em] rounded-full font-bold">
          I
        </button>
      </div>
    </nav>
  );
}
