'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Transaction, formatAddress, formatUSD, getTransactionUrl } from '../../lib/wallet-utils';

interface RecentActivityProps {
  transactions: Transaction[];
  walletType: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  transactions,
  walletType,
  isLoading,
  onRefresh
}) => {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case 'swap':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'text-red-400';
      case 'receive':
        return 'text-green-400';
      case 'swap':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const toggleExpanded = (txHash: string) => {
    setExpandedTx(expandedTx === txHash ? null : txHash);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No activity found</p>
          <p className="text-gray-500 text-sm">
            Your recent transactions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 transition-colors cursor-pointer"
              onClick={() => toggleExpanded(tx.hash)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(tx.status)}
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium capitalize ${getTypeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(tx.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatAddress(tx.hash, 8)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${getTypeColor(tx.type)}`}>
                    {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                  </div>
                  {tx.usdValue && (
                    <div className="text-xs text-gray-400">
                      {formatUSD(tx.usdValue)}
                    </div>
                  )}
                </div>
              </div>

              {expandedTx === tx.hash && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-600"
                >
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">From:</span>
                      <p className="text-white font-mono mt-1">{formatAddress(tx.from, 12)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">To:</span>
                      <p className="text-white font-mono mt-1">{formatAddress(tx.to, 12)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <p className={`mt-1 capitalize ${
                        tx.status === 'confirmed' ? 'text-green-400' : 
                        tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {tx.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Time:</span>
                      <p className="text-white mt-1">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getTransactionUrl(tx.hash, walletType), '_blank');
                      }}
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Explorer</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};