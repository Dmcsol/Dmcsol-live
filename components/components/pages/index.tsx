import React from 'react';
import { WalletContextProvider } from '../components/WalletContextProvider';
import { SwapCard } from '../components/SwapCard';

export default function Home() {
  return (
    <WalletContextProvider>
      <main className="bg-slate-950 text-slate-100 flex items-center justify-center min-h-screen">
        <SwapCard />
      </main>
    </WalletContextProvider>
  );
}
