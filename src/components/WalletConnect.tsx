'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Download
} from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  downloadUrl: string; // URL untuk download wallet
  detect: () => boolean;
  connect: () => Promise<{ success: boolean; address?: string; error?: string }>;
}

export const WalletConnect: React.FC = () => {
  const router = useRouter();
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      color: 'orange',
      downloadUrl: 'https://metamask.io/download/',
      detect: () => typeof window !== 'undefined' && !!(window as any).ethereum?.isMetaMask,
      connect: async () => {
        try {
          if (!(window as any).ethereum?.isMetaMask) {
            return { success: false, error: 'MetaMask not detected' };
          }
          
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          return { success: true, address: accounts[0] };
        } catch (error: any) {
          return { 
            success: false, 
            error: error.code === 4001 ? 'User rejected connection' : 'Connection failed' 
          };
        }
      }
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      color: 'purple',
      downloadUrl: 'https://phantom.app/',
      detect: () => typeof window !== 'undefined' && !!(window as any).phantom?.solana,
      connect: async () => {
        try {
          if (!(window as any).phantom?.solana) {
            return { success: false, error: 'Phantom wallet not detected' };
          }
          
          const response = await (window as any).phantom.solana.connect();
          return { success: true, address: response.publicKey.toString() };
        } catch (error: any) {
          return { 
            success: false, 
            error: error.code === 4001 ? 'User rejected connection' : 'Connection failed' 
          };
        }
      }
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      color: 'blue',
      downloadUrl: 'https://www.coinbase.com/wallet',
      detect: () => typeof window !== 'undefined' && !!(window as any).ethereum?.isCoinbaseWallet,
      connect: async () => {
        try {
          if (!(window as any).ethereum?.isCoinbaseWallet) {
            return { success: false, error: 'Coinbase Wallet not detected' };
          }
          
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          return { success: true, address: accounts[0] };
        } catch (error: any) {
          return { 
            success: false, 
            error: error.code === 4001 ? 'User rejected connection' : 'Connection failed' 
          };
        }
      }
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      color: 'cyan',
      downloadUrl: 'https://trustwallet.com/',
      detect: () => typeof window !== 'undefined' && !!(window as any).ethereum?.isTrust,
      connect: async () => {
        try {
          if (!(window as any).ethereum?.isTrust) {
            return { success: false, error: 'Trust Wallet not detected' };
          }
          
          const accounts = await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          return { success: true, address: accounts[0] };
        } catch (error: any) {
          return { 
            success: false, 
            error: error.code === 4001 ? 'User rejected connection' : 'Connection failed' 
          };
        }
      }
    },
    {
      id: 'binance',
      name: 'Binance Chain Wallet',
      icon: '🟡',
      color: 'yellow',
      downloadUrl: 'https://www.binance.org/en/binance-wallet',
      detect: () => typeof window !== 'undefined' && !!(window as any).BinanceChain,
      connect: async () => {
        try {
          if (!(window as any).BinanceChain) {
            return { success: false, error: 'Binance Chain Wallet not detected' };
          }
          
          const accounts = await (window as any).BinanceChain.request({
            method: 'eth_requestAccounts',
          });
          
          return { success: true, address: accounts[0] };
        } catch (error: any) {
          return { 
            success: false, 
            error: error.code === 4001 ? 'User rejected connection' : 'Connection failed' 
          };
        }
      }
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      color: 'indigo',
      downloadUrl: 'https://walletconnect.com/',
      detect: () => true, // WalletConnect is always available
      connect: async () => {
        try {
          // Simplified WalletConnect simulation
          // In real implementation, you'd use @walletconnect/client
          return { success: true, address: '0x' + Math.random().toString(16).substr(2, 40) };
        } catch (error: any) {
          return { success: false, error: 'WalletConnect failed' };
        }
      }
    }
  ];

  // Load connected wallets from localStorage (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('connectedWallets');
      if (saved) {
        setConnectedWallets(JSON.parse(saved));
      }
    }
  }, []);

  // Save connected wallets to localStorage
  const saveConnectedWallets = (wallets: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('connectedWallets', JSON.stringify(wallets));
    }
    setConnectedWallets(wallets);
  };

  const handleConnect = async (wallet: WalletOption) => {
    setConnectingWallet(wallet.id);
    setErrors({ ...errors, [wallet.id]: '' });

    try {
      const result = await wallet.connect();
      
      if (result.success) {
        const newConnectedWallets = [...connectedWallets, wallet.id];
        saveConnectedWallets(newConnectedWallets);
        
        // Save wallet details
        if (typeof window !== 'undefined') {
          localStorage.setItem(`wallet_${wallet.id}`, JSON.stringify({
            name: wallet.name,
            address: result.address,
            connectedAt: new Date().toISOString()
          }));
        }
        
        // Redirect to wallet page after successful connection
        setTimeout(() => {
          router.push('/wallet');
        }, 1000);
      } else {
        setErrors({ ...errors, [wallet.id]: result.error || 'Connection failed' });
      }
    } catch (error) {
      setErrors({ ...errors, [wallet.id]: 'Unexpected error occurred' });
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleWalletAction = (wallet: WalletOption) => {
    const isConnected = connectedWallets.includes(wallet.id);
    const isDetected = wallet.detect();

    if (isConnected) {
      // Disconnect wallet
      handleDisconnect(wallet.id);
    } else if (isDetected) {
      // Connect wallet
      handleConnect(wallet);
    } else {
      // Redirect to download page
      window.open(wallet.downloadUrl, '_blank');
    }
  };

  const handleDisconnect = (walletId: string) => {
    const newConnectedWallets = connectedWallets.filter(id => id !== walletId);
    saveConnectedWallets(newConnectedWallets);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`wallet_${walletId}`);
    }
    setErrors({ ...errors, [walletId]: '' });
  };

  const getColorClasses = (color: string, isConnected: boolean) => {
    const baseClasses = {
      orange: isConnected ? 'bg-orange-600 hover:bg-orange-700 border-orange-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600',
      purple: isConnected ? 'bg-purple-600 hover:bg-purple-700 border-purple-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600',
      blue: isConnected ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600',
      cyan: isConnected ? 'bg-cyan-600 hover:bg-cyan-700 border-cyan-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600',
      yellow: isConnected ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600',
      indigo: isConnected ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600',
    };
    return baseClasses[color as keyof typeof baseClasses];
  };

  const getButtonText = (wallet: WalletOption) => {
    const isConnected = connectedWallets.includes(wallet.id);
    const isDetected = wallet.detect();
    
    if (isConnected) return 'Connected';
    if (isDetected) return 'Connect';
    return 'Install';
  };

  const getIcon = (wallet: WalletOption) => {
    const isConnected = connectedWallets.includes(wallet.id);
    const isDetected = wallet.detect();
    const isConnecting = connectingWallet === wallet.id;
    
    if (isConnecting) return <Loader2 className="w-4 h-4 text-white animate-spin" />;
    if (isConnected) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (isDetected) return <ExternalLink className="w-4 h-4 text-gray-400" />;
    return <Download className="w-4 h-4 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
        </div>
        {connectedWallets.length > 0 && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">
              {connectedWallets.length} connected
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {wallets.map((wallet) => {
          const isConnected = connectedWallets.includes(wallet.id);
          const isConnecting = connectingWallet === wallet.id;
          const hasError = errors[wallet.id];
          const isDetected = wallet.detect();

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <button
                onClick={() => handleWalletAction(wallet)}
                disabled={isConnecting}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  getColorClasses(wallet.color, isConnected)
                } ${isConnecting ? 'opacity-70' : ''} hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{wallet.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {wallet.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getButtonText(wallet)}
                      {!isDetected && ' & Use'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getIcon(wallet)}
                </div>
              </button>

              {hasError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-900/20 border border-red-700 rounded-lg"
                >
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-300">{hasError}</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700 space-y-3">
        {connectedWallets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => router.push('/wallet')}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">View Wallet Details</span>
            </button>
          </motion.div>
        )}
        
        <div className="text-xs text-gray-400 text-center">
          <p>Don't have a wallet? Click on any wallet above to install it.</p>
        </div>
      </div>
    </motion.div>
  );
};