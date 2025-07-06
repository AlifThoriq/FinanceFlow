import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface WalletBalance {
  symbol: string;
  balance: string;
  decimals: number;
  usdValue: number;
  tokenAddress?: string;
}

export interface WalletInfo {
  id: string;
  name: string;
  address: string;
  type: 'ethereum' | 'solana' | 'binance';
  icon: string;
  color: string;
  connectedAt: string;
}

export interface TokenPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

export interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  symbol: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  from: string;
  to: string;
  usdValue?: number;
}

// Format address untuk display
export const formatAddress = (address: string, length: number = 6): string => {
  if (!address) return '';
  return `${address.slice(0, length)}...${address.slice(-4)}`;
};

// Format balance untuk display
export const formatBalance = (balance: number, decimals: number = 6): string => {
  if (balance === 0) return '0';
  if (balance < 0.000001) return '< 0.000001';
  return balance.toFixed(decimals);
};

// Format USD value
export const formatUSD = (value: number): string => {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '< $0.01';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Get wallet configuration
export const getWalletConfig = (walletId: string) => {
  const configs = {
    metamask: { name: 'MetaMask', icon: '🦊', color: 'orange', type: 'ethereum' as const },
    phantom: { name: 'Phantom', icon: '👻', color: 'purple', type: 'solana' as const },
    coinbase: { name: 'Coinbase Wallet', icon: '🔵', color: 'blue', type: 'ethereum' as const },
    trust: { name: 'Trust Wallet', icon: '🛡️', color: 'cyan', type: 'ethereum' as const },
    binance: { name: 'Binance Chain Wallet', icon: '🟡', color: 'yellow', type: 'binance' as const },
    walletconnect: { name: 'WalletConnect', icon: '🔗', color: 'indigo', type: 'ethereum' as const }
  };
  return configs[walletId as keyof typeof configs];
};

// Get color classes for UI
export const getColorClasses = (color: string) => {
  const colors = {
    orange: 'from-orange-600 to-orange-800 border-orange-500',
    purple: 'from-purple-600 to-purple-800 border-purple-500',
    blue: 'from-blue-600 to-blue-800 border-blue-500',
    cyan: 'from-cyan-600 to-cyan-800 border-cyan-500',
    yellow: 'from-yellow-600 to-yellow-800 border-yellow-500',
    indigo: 'from-indigo-600 to-indigo-800 border-indigo-500',
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

// Convert Wei to Ether
export const weiToEther = (wei: string): number => {
  return parseInt(wei, 16) / 1e18;
};

// Convert Lamports to SOL
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

// Validate Solana address
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Validate Ethereum address
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Get explorer URL
export const getExplorerUrl = (address: string, type: string): string => {
  switch (type) {
    case 'solana':
      return `https://explorer.solana.com/address/${address}`;
    case 'ethereum':
      return `https://etherscan.io/address/${address}`;
    case 'binance':
      return `https://bscscan.com/address/${address}`;
    default:
      return `https://etherscan.io/address/${address}`;
  }
};

// Get transaction explorer URL
export const getTransactionUrl = (hash: string, type: string): string => {
  switch (type) {
    case 'solana':
      return `https://explorer.solana.com/tx/${hash}`;
    case 'ethereum':
      return `https://etherscan.io/tx/${hash}`;
    case 'binance':
      return `https://bscscan.com/tx/${hash}`;
    default:
      return `https://etherscan.io/tx/${hash}`;
  }
};