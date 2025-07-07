import { formatEther, parseEther, isAddress } from 'viem';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

// Ethereum utilities
export const ethereumUtils = {
  // Format Wei to Ether
  formatWei: (wei: bigint): string => {
    return formatEther(wei);
  },
  
  // Parse Ether to Wei
  parseEther: (ether: string): bigint => {
    return parseEther(ether);
  },
  
  // Validate Ethereum address
  isValidAddress: (address: string): boolean => {
    return isAddress(address);
  },
  
  // Format address for display
  formatAddress: (address: string, chars: number = 4): string => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
  },
  
  // Format balance with decimals
  formatBalance: (balance: string, decimals: number = 6): string => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  },
  
  // Convert gas price from gwei to wei
  gweiToWei: (gwei: number): bigint => {
    return BigInt(gwei) * BigInt(1e9);
  },
  
  // Convert wei to gwei
  weiToGwei: (wei: bigint): number => {
    return Number(wei) / 1e9;
  },
};

// Solana utilities
export const solanaUtils = {
  // Format Lamports to SOL
  formatLamports: (lamports: number): string => {
    return (lamports / LAMPORTS_PER_SOL).toString();
  },
  
  // Parse SOL to Lamports
  parseSol: (sol: string): number => {
    return parseFloat(sol) * LAMPORTS_PER_SOL;
  },
  
  // Validate Solana address
  isValidAddress: (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  },
  
  // Format address for display
  formatAddress: (address: string, chars: number = 4): string => {
    if (!address) return '';
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  },
  
  // Format balance with decimals
  formatBalance: (balance: string, decimals: number = 6): string => {
    const num = parseFloat(balance);
    return num.toFixed(decimals);
  },
  
  // Convert SOL to Lamports
  solToLamports: (sol: number): number => {
    return sol * LAMPORTS_PER_SOL;
  },
  
  // Convert Lamports to SOL
  lamportsToSol: (lamports: number): number => {
    return lamports / LAMPORTS_PER_SOL;
  },
};

// General utilities
export const generalUtils = {
  // Copy to clipboard
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  },
  
  // Format USD amount
  formatUsd: (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },
  
  // Format number with commas
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  },
  
  // Truncate string
  truncateString: (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
  },
  
  // Generate unique ID
  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  },
  
  // Debounce function
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Sleep function
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

// Transaction utilities
export const transactionUtils = {
  // Get transaction status color
  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
      case 'processing':
        return 'text-yellow-500';
      case 'failed':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  },
  
  // Format transaction hash
  formatTxHash: (hash: string, chars: number = 6): string => {
    if (!hash) return '';
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
  },
  
  // Get transaction explorer URL
  getExplorerUrl: (hash: string, network: 'ethereum' | 'solana', chainId?: number): string => {
    if (network === 'ethereum') {
      const baseUrls: Record<number, string> = {
        1: 'https://etherscan.io',
        11155111: 'https://sepolia.etherscan.io',
        137: 'https://polygonscan.com',
        42161: 'https://arbiscan.io',
        10: 'https://optimistic.etherscan.io',
        8453: 'https://basescan.org',
      };
      const baseUrl = baseUrls[chainId || 1] || 'https://etherscan.io';
      return `${baseUrl}/tx/${hash}`;
    } else {
      return `https://explorer.solana.com/tx/${hash}`;
    }
  },
};

// Export all utilities
export const web3Utils = {
  ethereum: ethereumUtils,
  solana: solanaUtils,
  general: generalUtils,
  transaction: transactionUtils,
};