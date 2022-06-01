import { useRef, useState } from "react";
import CreateKeys from "../../Backend/core/wallet";
import { io } from "socket.io-client";

export default function SendBTC() {
  const COIN = 100000000;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [publicAddress, setPublicAddress] = useState("");

  const privateKey = useRef();

  const generateAddress = async (e) => {
    e.preventDefault();

    if (e.target.value) {
      privateKey.current = BigInt(e.target.value);
      setPublicAddress(new CreateKeys(privateKey.current).createPublicKey());
    } else {
      setPublicAddress("");
      privateKey.current = "";
    }
  };

  const resetValue = (e) => {
    e.target.fromAddress.value = "";
    e.target.toAddress.value = "";
    e.target.Amount.value = "";
    e.target.priv.value = "";
    setPublicAddress("");
    privateKey.current = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      priv: e.target.priv.value,
      fromAddress: e.target.fromAddress.value,
      toAddress: e.target.toAddress.value,
      Amount: e.target.Amount.value * COIN,
    };

    console.log(`data in sendBTC: ${JSON.stringify(data)}`);
    // Send the data to the server in JSON format.
    const JSONdata = JSON.stringify(data);

    // API endpoint where we send form data.
    const endpoint = "/api/unspentTx";

    // Form the request for sending data to the server.
    const options = {
      // The method is POST because we are sending data.
      method: "POST",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSONdata,
    };

    // Send the form data to our forms API on Vercel and get a response.
    const response = await fetch(endpoint, options);

    // Get the response data from server as JSON.
    // If server returns the name submitted, that means the form works.
    const result = await response.json();

    const socket = io("http://localhost:3600");

    socket.on("connect", () => {
      console.log(`Connected to the server with socket id: ${socket.id}`);
      socket.emit("ADD_TX_IN_MEMPOOL", result.data);
      // socket.disconnect();
      setIsSubmitted(true);
      resetValue(e);
    });
  };

  return (
    <div className="bg-black flex justify-center items-center min-h-[100vh] text-white">
      <div className="bg-gradient-to-r from-teal-400 to-blue-500 min-h-[60vh] min-w-[80vw] rounded-2xl -mt-[4em]">
        <div className="flex justify-center items-center mt-[2em] font-bold text-4xl">
          Send Bitcoin
        </div>
        <form
          className="flex flex-col px-[4em] mt-[2em] "
          onSubmit={handleSubmit}
          // onSubmit={(e) => handleSubmit(e, socket)}
        >
          <label className=" text-xl mb-[1em]" htmlFor="priv">
            Private Key:
          </label>

          <input
            className="outline-teal-400  rounded-2xl h-[3em] mb-[1em] text-black pl-[1em]"
            onChange={generateAddress}
            type="text"
            id="priv"
            name="priv"
            required
          />

          {privateKey.current && (
            <>
              <label className=" text-xl mb-[1em]" htmlFor="fromAddress">
                From Public Address:
              </label>
              <input
                className="outline-teal-400  rounded-2xl h-[3em] mb-[1em] text-black pl-[1em]"
                type="text"
                id="fromAddress"
                name="fromAddress"
                value={publicAddress}
                disabled
              />
            </>
          )}

          <label className=" text-xl mb-[1em]" htmlFor="toAddress">
            To Address:
          </label>
          <input
            className=" outline-teal-400 rounded-2xl h-[3em] mb-[1em] text-black pl-[1em]"
            type="text"
            id="toAddress"
            name="toAddress"
            required
          />
          <label className=" text-xl mb-[1em]" htmlFor="Amount">
            Amount:
          </label>
          <input
            className=" outline-teal-400 rounded-2xl h-[3em] mb-[2em] text-black pl-[1em]"
            type="Number"
            id="Amount"
            name="Amount"
            required
          />
          {isSubmitted && (
            <h1 className="mb-[1em] font-bold text-xl ">
              {" "}
              Transaction Submitted to the Memory Pool
            </h1>
          )}
          <button
            className=" self-center font-bold  bg-gradient-to-r  from-indigo-700 to-sky-600 rounded-2xl h-[3em] w-[8em] mb-[2em]"
            type="submit"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
