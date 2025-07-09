'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '@/lib/web3/ethereum/wagmi';
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

// Create modal hanya di client side untuk menghindari SSR issues
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    enableAnalytics: false, // Disable untuk production kecuali diperlukan
    enableOnramp: true,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#3b82f6',
      '--w3m-border-radius-master': '12px',
    },
    // Tambahan config untuk production
    featuredWalletIds: [
      // MetaMask
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      // WalletConnect
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
      // Coinbase
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    ],
  });
}

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
