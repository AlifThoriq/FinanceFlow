'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

// Types
export type WalletType = 'ethereum' | 'solana';

export interface WalletInfo {
  type: WalletType;
  address: string;
  balance: string;
  isConnected: boolean;
  chainId?: number;
  walletName?: string;
}

interface WalletContextType {
  selectedWallet: WalletType;
  setSelectedWallet: (wallet: WalletType) => void;
  ethereumWallet: WalletInfo | null;
  solanaWallet: WalletInfo | null;
  isAnyWalletConnected: boolean;
  switchWallet: (wallet: WalletType) => void;
  disconnectAll: () => void;
}

// Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Provider component
interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletType>('ethereum');
  const [ethereumWallet, setEthereumWallet] = useState<WalletInfo | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<WalletInfo | null>(null);

  // Ethereum wallet hooks
  const { address: ethAddress, isConnected: ethConnected, chain } = useAccount();
  
  // Solana wallet hooks
  const { publicKey: solPublicKey, connected: solConnected, wallet: solWallet } = useWallet();

  // Update Ethereum wallet info
  useEffect(() => {
    if (ethConnected && ethAddress) {
      setEthereumWallet({
        type: 'ethereum',
        address: ethAddress,
        balance: '0', // This will be updated from the component
        isConnected: true,
        chainId: chain?.id,
        walletName: 'MetaMask', // This can be detected from the connector
      });
    } else {
      setEthereumWallet(null);
    }
  }, [ethConnected, ethAddress, chain]);

  // Update Solana wallet info
  useEffect(() => {
    if (solConnected && solPublicKey) {
      setSolanaWallet({
        type: 'solana',
        address: solPublicKey.toString(),
        balance: '0', // This will be updated from the component
        isConnected: true,
        walletName: solWallet?.adapter.name,
      });
    } else {
      setSolanaWallet(null);
    }
  }, [solConnected, solPublicKey, solWallet]);

  // Check if any wallet is connected
  const isAnyWalletConnected = ethereumWallet?.isConnected || solanaWallet?.isConnected || false;

  // Switch wallet function
  const switchWallet = (wallet: WalletType) => {
    setSelectedWallet(wallet);
  };

  // Disconnect all wallets
  const disconnectAll = () => {
    // Note: Actual disconnection should be handled by the respective wallet components
    setEthereumWallet(null);
    setSolanaWallet(null);
  };

  // Context value
  const value: WalletContextType = {
    selectedWallet,
    setSelectedWallet,
    ethereumWallet,
    solanaWallet,
    isAnyWalletConnected,
    switchWallet,
    disconnectAll,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use wallet context
export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

// Helper hooks for specific wallets
export function useEthereumWallet() {
  const { ethereumWallet } = useWalletContext();
  return ethereumWallet;
}

export function useSolanaWallet() {
  const { solanaWallet } = useWalletContext();
  return solanaWallet;
}

// Helper hook to get active wallet
export function useActiveWallet() {
  const { selectedWallet, ethereumWallet, solanaWallet } = useWalletContext();
  
  if (selectedWallet === 'ethereum') {
    return ethereumWallet;
  } else {
    return solanaWallet;
  }
}