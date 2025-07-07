import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

export const solanaConfig = {
  // Default network
  defaultNetwork: WalletAdapterNetwork.Mainnet,
  
  // RPC endpoints
  rpcEndpoints: {
    mainnet: 'https://api.mainnet-beta.solana.com',
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
  },
  
  // Block explorers
  blockExplorers: {
    mainnet: 'https://explorer.solana.com',
    devnet: 'https://explorer.solana.com/?cluster=devnet',
    testnet: 'https://explorer.solana.com/?cluster=testnet',
  },
  
  // Supported wallets
  supportedWallets: [
    'phantom',
    'solflare',
    'backpack',
    'mathwallet',
    'coin98',
    'slope',
    'sollet',
  ] as const,
  
  // Network configurations
  networks: {
    [WalletAdapterNetwork.Mainnet]: {
      name: 'Mainnet Beta',
      url: 'https://api.mainnet-beta.solana.com',
      explorer: 'https://explorer.solana.com',
    },
    [WalletAdapterNetwork.Devnet]: {
      name: 'Devnet',
      url: clusterApiUrl(WalletAdapterNetwork.Devnet),
      explorer: 'https://explorer.solana.com/?cluster=devnet',
    },
    [WalletAdapterNetwork.Testnet]: {
      name: 'Testnet',
      url: clusterApiUrl(WalletAdapterNetwork.Testnet),
      explorer: 'https://explorer.solana.com/?cluster=testnet',
    },
  },
  
  // Transaction fees (in lamports)
  defaultFee: 5000,
  maxFee: 100000,
  
  // Connection timeout
  connectionTimeout: 30000,
};

export type SupportedWallet = typeof solanaConfig.supportedWallets[number];

// Helper function to get network info
export const getNetworkInfo = (network: WalletAdapterNetwork) => {
  return solanaConfig.networks[network];
};

// Helper function to get explorer URL
export const getExplorerUrl = (signature: string, network: WalletAdapterNetwork = WalletAdapterNetwork.Mainnet) => {
  const baseUrl = solanaConfig.networks[network].explorer;
  return `${baseUrl}/tx/${signature}`;
};

// Helper function to get address explorer URL
export const getAddressExplorerUrl = (address: string, network: WalletAdapterNetwork = WalletAdapterNetwork.Mainnet) => {
  const baseUrl = solanaConfig.networks[network].explorer;
  return `${baseUrl}/address/${address}`;
};