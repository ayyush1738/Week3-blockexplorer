import { Alchemy, Network } from "alchemy-sdk";
import { useEffect, useState } from "react";
import "./App.css";

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY, // Make sure this is set in .env
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [blockReceipt, setBlockReceipt] = useState(null);

  useEffect(() => {
    async function getBlockData() {
      try {
        // 1️⃣ Get the latest block number
        const latestBlockNumber = await alchemy.core.getBlockNumber();
        setBlockNumber(latestBlockNumber);

        // 2️⃣ Get full block details with transactions
        const block = await alchemy.core.getBlockWithTransactions(latestBlockNumber);
        setBlockData(block);

        // 3️⃣ Get the first transaction’s receipt (if it exists)
        if (block.transactions.length > 0) {
          const firstTxHash = block.transactions[0].hash;
          const receipt = await alchemy.core.getTransactionReceipt(firstTxHash);
          setBlockReceipt(receipt);
        } else {
          setBlockReceipt("No transactions in this block");
        }
      } catch (error) {
        console.error("Error fetching block data:", error);
      }
    }

    getBlockData();
  }, []);

  return (
    <div className="App" style={{ fontFamily: "monospace", padding: "1rem" }}>
      <h2>Latest Ethereum Block Info</h2>

      <section>
        <strong>Block Number:</strong> {blockNumber ?? "Loading..."}
      </section>

      {blockData && (
        <pre style={{ textAlign: "left", marginTop: "1rem" }}>
          {JSON.stringify(blockData, null, 2)}
        </pre>
      )}

      {blockReceipt && (
        <section style={{ marginTop: "1rem" }}>
          <strong>First Transaction Receipt:</strong>
          <pre style={{ textAlign: "left" }}>
            {typeof blockReceipt === "string"
              ? blockReceipt
              : JSON.stringify(blockReceipt, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

export default App;
