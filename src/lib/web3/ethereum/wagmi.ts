import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { cookieStorage, createStorage } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'wagmi/chains';

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Create metadata
const metadata = {
  name: 'Crypto Wallet Dashboard',
  description: 'Multi-chain wallet dashboard for managing your crypto assets',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Create wagmi config
export const config = defaultWagmiConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism, base],
  projectId,
  metadata,
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});

// RPC endpoints
export const rpcEndpoints = {
  mainnet: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  sepolia: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  polygon: `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  arbitrum: `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  optimism: `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  base: `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
};