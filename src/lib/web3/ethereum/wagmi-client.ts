'use client';

import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'wagmi/chains';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

const metadata = {
  name: 'Crypto Wallet Dashboard',
  description: 'Multi-chain wallet dashboard for managing your crypto assets',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const config = defaultWagmiConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism, base],
  projectId,
  metadata,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
