'use client';

import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '@/lib/web3/ethereum/wagmi';
import { SolanaWalletProvider } from '@/lib/web3/solana/adapter';

// Create a client
const queryClient = new QueryClient();

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
    '--w3m-border-radius-master': '12px',
  }
});

interface Web3ProvidersProps {
  children: ReactNode;
}

export function Web3Providers({ children }: Web3ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}