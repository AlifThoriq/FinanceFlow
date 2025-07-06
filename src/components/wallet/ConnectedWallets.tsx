'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  ExternalLink, 
  LogOut, 
  RefreshCw, 
  CheckCircle,
  Network
} from 'lucide-react';
import { WalletInfo, WalletBalance, formatAddress, formatUSD, getColorClasses, getExplorerUrl } from '../../lib/wallet-utils';

interface ConnectedWalletsProps {
  wallets: WalletInfo[];
  balances: { [key: string]: WalletBalance[] };
  onRefresh: (walletId: string) => void;
  onDisconnect: (walletId: string) => void;
  refreshing: { [key: string]: boolean };
}

export const ConnectedWallets: React.FC<ConnectedWalletsProps> = ({
  wallets,
  balances,
  onRefresh,
  onDisconnect,
  refreshing
}) => {
  const [showAddresses, setShowAddresses] = useState<{ [key: string]: boolean }>({});
  const [copying, setCopying] = useState<{ [key: string]: boolean }>({});

  const toggleAddressVisibility = (walletId: string) => {
    setShowAddresses(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  const copyAddress = async (walletId: string, address: string) => {
    setCopying(prev => ({ ...prev, [walletId]: true }));
    
    try {
      await navigator.clipboard.writeText(address);
      setTimeout(() => {
        setCopying(prev => ({ ...prev, [walletId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
      setCopying(prev => ({ ...prev, [walletId]: false }));
    }
  };

  const getTotalUSDValue = (walletBalances: WalletBalance[]) => {
    return walletBalances.reduce((total, balance) => total + balance.usdValue, 0);
  };

  const getMainBalance = (walletBalances: WalletBalance[]) => {
    return walletBalances.find(b => ['SOL', 'ETH', 'BNB'].includes(b.symbol)) || walletBalances[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Connected Wallets</h3>
        <span className="text-sm text-gray-400">{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-4">
        {wallets.map((wallet, index) => {
          const walletBalances = balances[wallet.id] || [];
          const totalUSD = getTotalUSDValue(walletBalances);
          const mainBalance = getMainBalance(walletBalances);
          const isShowingAddress = showAddresses[wallet.id];
          const isCopying = copying[wallet.id];
          const isRefreshing = refreshing[wallet.id];

          return (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${getColorClasses(wallet.color)} border backdrop-blur-sm rounded-xl p-4 shadow-lg`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <h4 className="font-semibold text-white">{wallet.name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                      <Network className="w-3 h-3" />
                      <span>{wallet.type.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRefresh(wallet.id)}
                    disabled={isRefreshing}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => onDisconnect(wallet.id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-300">Address</span>
                  <button
                    onClick={() => toggleAddressVisibility(wallet.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {isShowingAddress ? (
                      <EyeOff className="w-3 h-3 text-gray-400" />
                    ) : (
                      <Eye className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/20 rounded-lg p-2">
                  <span className="text-white font-mono text-sm">
                    {isShowingAddress ? formatAddress(wallet.address, 8) : '•'.repeat(16)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => copyAddress(wallet.id, wallet.address)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {isCopying ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => window.open(getExplorerUrl(wallet.address, wallet.type), '_blank')}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Total Value</span>
                  <span className="text-sm font-semibold text-white">{formatUSD(totalUSD)}</span>
                </div>
                
                {mainBalance && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Main Balance</span>
                    <span className="text-sm text-white">
                      {mainBalance.balance} {mainBalance.symbol}
                    </span>
                  </div>
                )}
                
                {walletBalances.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">Tokens</span>
                    <span className="text-sm text-white">{walletBalances.length - 1} token{walletBalances.length - 1 !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};