'use client';

import { useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '@/lib/web3/ethereum/wagmi-client';

export function Web3ModalClient() {
  useEffect(() => {
    createWeb3Modal({
      wagmiConfig: config,
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      enableAnalytics: false,
      enableOnramp: true,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#3b82f6',
        '--w3m-border-radius-master': '12px',
      },
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
      ],
    });
  }, []);

  return null;
}
