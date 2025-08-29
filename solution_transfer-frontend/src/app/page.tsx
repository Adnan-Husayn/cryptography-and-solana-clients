"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import ClientOnly from "@/components/ClientOnly";

export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    (async () => {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    })();
  }, [publicKey, connection]);

  const handleSend = async () => {
    if (!publicKey) return alert("Connect your wallet first!");
    if (!recipient || !amount) return alert("Please enter recipient and amount");

    try {
      console.log(1);
      
      setLoading(true);
      const recipientPubKey = new PublicKey(recipient);
      
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        })
      );
      console.log(2);
      
      const signature = await sendTransaction(tx, connection);
      
      console.log(3);
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature, ...latest },
        "confirmed"
      );
      console.log(4);
      
      alert(`✅ Transaction successful! Signature: ${signature}`);
      setRecipient("");
      setAmount("");

      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.error("Transaction failed", err);
      alert("❌ Transaction failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white p-6">
      <h1 className="text-4xl font-extrabold mb-6">🚀 Solana Transfer App</h1>

      <ClientOnly>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition px-6 py-2 rounded-xl font-semibold shadow-lg" />
      </ClientOnly>

      {publicKey && (
        <div className="mt-6 w-full max-w-md bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="text-lg font-semibold text-purple-300">
            Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : "Loading..."}
          </div>

          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
          />

          <input
            type="number"
            placeholder="Amount in SOL"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-purple-400"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-105"
          >
            {loading ? "Sending..." : "Send SOL"}
          </button>
        </div>
      )}
    </main>
  );
}
