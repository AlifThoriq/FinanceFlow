'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { PortfolioOverview } from '../../components/wallet/PortfolioOverview';
import { ConnectedWallets } from '../../components/wallet/ConnectedWallets';
import { QuickActions } from '../../components/wallet/QuickActions';
import { RecentActivity } from '../../components/wallet/RecentActivity';
import { 
  WalletInfo, 
  WalletBalance, 
  Transaction,
  formatAddress,
  formatBalance,
  formatUSD,
  getWalletConfig,
  getColorClasses,
  isValidSolanaAddress,
  isValidEthereumAddress,
  getExplorerUrl
} from '../../lib/wallet-utils';
import { 
  getWalletBalance, 
  getWalletTransactions,
  getTokenPrices 
} from '../../lib/wallet-api';

// Wallet storage key
const WALLET_STORAGE_KEY = 'connected_wallets';

// Mock wallet API functions
const walletApi = {
  async getConnectedWallets(): Promise<WalletInfo[]> {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading wallets from storage:', error);
      return [];
    }
  },

  async saveConnectedWallets(wallets: WalletInfo[]): Promise<void> {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
    } catch (error) {
      console.error('Error saving wallets to storage:', error);
    }
  },

  async removeWallet(walletId: string): Promise<void> {
    try {
      const wallets = await this.getConnectedWallets();
      const filtered = wallets.filter(w => w.id !== walletId);
      await this.saveConnectedWallets(filtered);
    } catch (error) {
      console.error('Error removing wallet:', error);
    }
  }
};

// Wallet connection functions
const connectWallet = async (walletType: string): Promise<WalletInfo | null> => {
  try {
    let walletInfo: WalletInfo | null = null;
    
    switch (walletType) {
      case 'solana':
        if ((window as any).solana) {
          const resp = await (window as any).solana.connect();
          const address = resp.publicKey.toString();
          walletInfo = {
            id: `phantom_${Date.now()}`,
            name: 'Phantom',
            address,
            type: 'solana',
            icon: '👻',
            color: 'purple',
            connectedAt: new Date().toISOString()
          };
        } else {
          // Simulate wallet connection for demo
          walletInfo = {
            id: `solana_${Date.now()}`,
            name: 'Solana Wallet',
            address: 'DemoSolanaAddress123...',
            type: 'solana',
            icon: '🌟',
            color: 'purple',
            connectedAt: new Date().toISOString()
          };
        }
        break;
        
      case 'ethereum':
        if ((window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          if (accounts.length > 0) {
            walletInfo = {
              id: `metamask_${Date.now()}`,
              name: 'MetaMask',
              address: accounts[0],
              type: 'ethereum',
              icon: '🦊',
              color: 'orange',
              connectedAt: new Date().toISOString()
            };
          }
        } else {
          // Simulate wallet connection for demo
          walletInfo = {
            id: `ethereum_${Date.now()}`,
            name: 'Ethereum Wallet',
            address: '0xDemoEthereumAddress123...',
            type: 'ethereum',
            icon: '⚡',
            color: 'blue',
            connectedAt: new Date().toISOString()
          };
        }
        break;
        
      case 'binance':
        // Simulate BSC wallet connection
        walletInfo = {
          id: `binance_${Date.now()}`,
          name: 'Binance Chain Wallet',
          address: '0xDemoBinanceAddress123...',
          type: 'binance',
          icon: '🟡',
          color: 'yellow',
          connectedAt: new Date().toISOString()
        };
        break;
    }
    
    if (walletInfo) {
      // Save to storage
      const existingWallets = await walletApi.getConnectedWallets();
      await walletApi.saveConnectedWallets([...existingWallets, walletInfo]);
    }
    
    return walletInfo;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

const disconnectWallet = async (walletId: string): Promise<void> => {
  try {
    await walletApi.removeWallet(walletId);
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    throw error;
  }
};

// Fetch wallet balances
const fetchWalletBalances = async (address: string, type: string): Promise<WalletBalance[]> => {
  try {
    return await getWalletBalance('', address, type);
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    return [];
  }
};

// Fetch wallet transactions
const fetchWalletTransactions = async (address: string, type: string): Promise<Transaction[]> => {
  try {
    return await getWalletTransactions('', address, type);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return [];
  }
};

export default function WalletPage() {
  // State management
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [balances, setBalances] = useState<{ [key: string]: WalletBalance[] }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState<string>('solana');

  // Initialize data
  useEffect(() => {
    initializeWalletData();
  }, []);

  const initializeWalletData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load connected wallets from localStorage
      const savedWallets = await walletApi.getConnectedWallets();
      setWallets(savedWallets);
      
      // Load balances for each wallet
      if (savedWallets.length > 0) {
        await Promise.all(
          savedWallets.map((wallet: WalletInfo) => loadWalletBalance(wallet.id))
        );
        
        // Load recent transactions
        await loadRecentTransactions();
      }
    } catch (err) {
      console.error('Error initializing wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWalletBalance = async (walletId: string) => {
    try {
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) return;
      
      const walletBalances = await fetchWalletBalances(wallet.address, wallet.type);
      setBalances(prev => ({
        ...prev,
        [walletId]: walletBalances
      }));
    } catch (err) {
      console.error(`Error loading balance for wallet ${walletId}:`, err);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const allTransactions: Transaction[] = [];
      
      for (const wallet of wallets) {
        const walletTransactions = await fetchWalletTransactions(wallet.address, wallet.type);
        allTransactions.push(...walletTransactions);
      }
      
      // Sort by timestamp (newest first)
      const sortedTransactions = allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(sortedTransactions.slice(0, 10)); // Show last 10 transactions
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  // Refresh specific wallet
  const handleRefreshWallet = async (walletId: string) => {
    setRefreshing(prev => ({ ...prev, [walletId]: true }));
    try {
      await loadWalletBalance(walletId);
    } finally {
      setRefreshing(prev => ({ ...prev, [walletId]: false }));
    }
  };

  // Refresh all data
  const handleRefreshAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        ...wallets.map((wallet: WalletInfo) => loadWalletBalance(wallet.id)),
        loadRecentTransactions()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect new wallet
  const handleConnectWallet = async () => {
    try {
      const newWallet = await connectWallet(selectedWalletType);
      if (newWallet) {
        setWallets(prev => [...prev, newWallet]);
        await loadWalletBalance(newWallet.id);
        await loadRecentTransactions();
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  // Disconnect wallet
  const handleDisconnectWallet = async (walletId: string) => {
    try {
      await disconnectWallet(walletId);
      setWallets(prev => prev.filter(w => w.id !== walletId));
      setBalances(prev => {
        const newBalances = { ...prev };
        delete newBalances[walletId];
        return newBalances;
      });
      await loadRecentTransactions();
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  // Calculate portfolio stats
  const getTotalBalance = () => {
    return Object.values(balances).flat().reduce((total, balance) => total + balance.usdValue, 0);
  };

  const getTotalChange24h = () => {
    // This would be calculated based on real price data
    // For now, return a mock value
    return Math.random() * 10 - 5; // Random between -5% and +5%
  };

  const getTotalTokens = () => {
    return Object.values(balances).flat().length;
  };

  // Quick action handlers
  const handleSendCrypto = () => {
    // Navigate to send page or open modal
    console.log('Send crypto clicked');
  };

  const handleSwapTokens = () => {
    // Navigate to swap page or open modal
    console.log('Swap tokens clicked');
  };

  // Loading state
  if (isLoading && wallets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={initializeWalletData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (wallets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Your Wallet Dashboard
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Connect your first wallet to start managing your crypto portfolio
            </p>
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <select
                value={selectedWalletType}
                onChange={(e) => setSelectedWalletType(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="binance">Binance Smart Chain</option>
              </select>
              <button
                onClick={handleConnectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Secure</h3>
                <p className="text-gray-400 text-sm">Your wallet data is encrypted and secure</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Fast</h3>
                <p className="text-gray-400 text-sm">Lightning-fast transactions and updates</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Multi-chain</h3>
                <p className="text-gray-400 text-sm">Support for multiple blockchain networks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Wallet Dashboard
              </h1>
              <p className="text-gray-400">
                Manage your crypto portfolio across multiple wallets
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedWalletType}
                onChange={(e) => setSelectedWalletType(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="binance">Binance Smart Chain</option>
              </select>
              <button
                onClick={handleConnectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview */}
        <PortfolioOverview
          totalBalance={getTotalBalance()}
          totalChange24h={getTotalChange24h()}
          connectedWallets={wallets.length}
          totalTokens={getTotalTokens()}
          isLoading={isLoading}
          onRefresh={handleRefreshAll}
          hideBalance={hideBalance}
          onToggleBalance={() => setHideBalance(!hideBalance)}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Connected Wallets */}
          <div className="lg:col-span-2">
            <ConnectedWallets
              wallets={wallets}
              balances={balances}
              onRefresh={handleRefreshWallet}
              onDisconnect={handleDisconnectWallet}
              refreshing={refreshing}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <QuickActions
              wallets={wallets}
              onSendCrypto={handleSendCrypto}
              onSwapTokens={handleSwapTokens}
              onConnectWallet={handleConnectWallet}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <RecentActivity
            transactions={transactions}
            walletType={selectedWalletType}
            isLoading={isLoading}
            onRefresh={loadRecentTransactions}
          />
        </div>
      </div>
    </div>
  );
}