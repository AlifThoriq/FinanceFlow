'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '@/lib/web3/ethereum/wagmi-client';
import { SolanaWalletProvider } from '@/lib/web3/solana/adapter';
import dynamic from 'next/dynamic';

const Web3ModalClient = dynamic(
  () => import('@/components/web3/Web3ModalClient').then(mod => mod.Web3ModalClient),
  { ssr: false }
);  

// Create a client dengan config yang optimal untuk production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});



interface Web3ProvidersProps {
  children: ReactNode;
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          <Web3ModalClient /> {/* Tambahkan ini */}
          {children}
        </SolanaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
