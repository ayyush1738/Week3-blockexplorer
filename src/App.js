import { Alchemy, Network } from "alchemy-sdk";
import { useEffect, useState } from "react";
import "./App.css";

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY, // Ensure this is set in .env
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [latestBlockNumber, setLatestBlockNumber] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState("Select a block");
  const [open, setOpen] = useState(false);
  const [blockData, setBlockData] = useState(null);
  const [blockReceipt, setBlockReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest block number and generate last 10 block numbers
  useEffect(() => {
    async function fetchBlocks() {
      try {
        const latest = await alchemy.core.getBlockNumber();
        setLatestBlockNumber(latest);

        const blockOptions = Array.from({ length: 10 }, (_, i) => latest - i);
        setOptions(blockOptions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchBlocks();
  }, []);

  // Fetch block data and first transaction receipt when a block is selected
  const handleSelect = async (blockNum) => {
    setSelected(`Block #${blockNum}`);
    setOpen(false);
    setBlockData(null);
    setBlockReceipt(null);

    try {
      const block = await alchemy.core.getBlockWithTransactions(blockNum);
      setBlockData(block);

      if (block.transactions.length > 0) {
        const firstTxHash = block.transactions[0].hash;
        const receipt = await alchemy.core.getTransactionReceipt(firstTxHash);
        setBlockReceipt(receipt);
      } else {
        setBlockReceipt("No transactions in this block");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="App" style={{ fontFamily: "monospace", padding: "1rem" }}>
      <h2>Ethereum Block Explorer</h2>

      <div style={{ position: "relative", width: "250px", marginBottom: "1rem" }}>
        <div
          className="border border-gray-400 p-2 rounded cursor-pointer bg-white"
          onClick={() => setOpen(!open)}
        >
          {selected}
        </div>

        {open && (
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-md z-10">
            {loading && <div className="p-2 text-gray-500">Loading...</div>}
            {error && <div className="p-2 text-red-500">Error: {error}</div>}
            {!loading &&
              options.map((opt) => (
                <div
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  Block #{opt}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Block Data */}
      {blockData && (
        <div>
          <h3>Block Details</h3>
          <pre style={{ textAlign: "left", maxHeight: "300px", overflow: "auto" }}>
            {JSON.stringify(blockData, null, 2)}
          </pre>
        </div>
      )}

      {/* First Transaction Receipt */}
      {blockReceipt && (
        <div style={{ marginTop: "1rem" }}>
          <h3>First Transaction Receipt</h3>
          <pre style={{ textAlign: "left", maxHeight: "300px", overflow: "auto" }}>
            {typeof blockReceipt === "string"
              ? blockReceipt
              : JSON.stringify(blockReceipt, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
