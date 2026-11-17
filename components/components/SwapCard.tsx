import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';

const TREASURY_WALLET = "3kUaaXgG5xKha6m6Yd11gjgN7viHMev1cMVLVtVg89FJ";

export function SwapCard() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      setLoading(true);
      const inputMint = "So11111111111111111111111111111111111111112";
      const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
      const amount = 100000000;
      const feeBps = 30;

      const quoteRes = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&platformFeeBps=${feeBps}`
      );
      const quoteData = await quoteRes.json();

      const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: publicKey.toString(),
          feeAccount: TREASURY_WALLET,
          wrapAndUnwrapSol: true,
        }),
      });
      const { swapTransaction } = await swapRes.json();

      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      const signedTransaction = await signTransaction(transaction);

      const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: true,
      });
      alert(`Swap successful! Tx ID: ${txid}`);
    } catch (err) {
      console.error(err);
      alert("Swap failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold tracking-wider text-emerald-400">DMCSOL</h1>
        <WalletMultiButton className="!bg-slate-800 hover:!bg-slate-700 !text-xs !px-3 !py-1.5 !rounded-lg !border !border-slate-700 !h-auto" />
      </div>
      <button 
        onClick={handleSwap}
        disabled={loading}
        className="w-full mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition"
      >
        {loading ? 'Processing...' : 'Swap Tokens'}
      </button>
    </div>
  );
}
