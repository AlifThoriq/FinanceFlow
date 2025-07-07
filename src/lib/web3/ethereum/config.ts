import { Chain } from 'wagmi/chains';

export const ethereumConfig = {
  infuraApiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  
  // Supported chains
  supportedChains: [
    'mainnet',
    'sepolia', 
    'polygon',
    'arbitrum',
    'optimism',
    'base'
  ] as const,
  
  // RPC endpoints
  rpcEndpoints: {
    mainnet: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    sepolia: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    polygon: `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    arbitrum: `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    optimism: `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    base: `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
  },
  
  // Block explorers
  blockExplorers: {
    mainnet: 'https://etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    polygon: 'https://polygonscan.com',
    arbitrum: 'https://arbiscan.io',
    optimism: 'https://optimistic.etherscan.io',
    base: 'https://basescan.org',
  },
  
  // Native currencies
  nativeCurrencies: {
    mainnet: 'ETH',
    sepolia: 'ETH',
    polygon: 'MATIC',
    arbitrum: 'ETH',
    optimism: 'ETH',
    base: 'ETH',
  }
};

export type SupportedChain = typeof ethereumConfig.supportedChains[number];

// Helper function to get chain info
export const getChainInfo = (chainId: number) => {
  const chainMap: Record<number, { name: string; symbol: string; explorer: string }> = {
    1: { name: 'Ethereum', symbol: 'ETH', explorer: ethereumConfig.blockExplorers.mainnet },
    11155111: { name: 'Sepolia', symbol: 'ETH', explorer: ethereumConfig.blockExplorers.sepolia },
    137: { name: 'Polygon', symbol: 'MATIC', explorer: ethereumConfig.blockExplorers.polygon },
    42161: { name: 'Arbitrum', symbol: 'ETH', explorer: ethereumConfig.blockExplorers.arbitrum },
    10: { name: 'Optimism', symbol: 'ETH', explorer: ethereumConfig.blockExplorers.optimism },
    8453: { name: 'Base', symbol: 'ETH', explorer: ethereumConfig.blockExplorers.base },
  };
  
  return chainMap[chainId] || { name: 'Unknown', symbol: 'ETH', explorer: '' };
};