'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Wallet, 
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const WalletConnect: React.FC = () => {
  const router = useRouter();

  const wallets: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      color: 'orange',
      description: 'Most popular Ethereum wallet'
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      color: 'purple',
      description: 'Leading Solana wallet'
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      color: 'blue',
      description: 'Secure & user-friendly'
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      icon: '🛡️',
      color: 'cyan',
      description: 'Multi-chain mobile wallet'
    },
    {
      id: 'binance',
      name: 'Binance Chain Wallet',
      icon: '🟡',
      color: 'yellow',
      description: 'BSC ecosystem wallet'
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      color: 'indigo',
      description: 'Connect any wallet'
    }
  ];

  const handleConnectWallet = () => {
    router.push('/wallet');
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      orange: 'border-orange-500/30 bg-orange-500/10',
      purple: 'border-purple-500/30 bg-purple-500/10',
      blue: 'border-blue-500/30 bg-blue-500/10',
      cyan: 'border-cyan-500/30 bg-cyan-500/10',
      yellow: 'border-yellow-500/30 bg-yellow-500/10',
      indigo: 'border-indigo-500/30 bg-indigo-500/10',
    };
    return colorMap[color as keyof typeof colorMap];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Wallet className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Connect Your Wallet Now</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Securely connect your crypto wallet to start managing your portfolio
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-xs text-gray-300">Secure Connection</span>
        </div>
        <div className="flex items-center space-x-2 p-3 bg-gray-700/30 rounded-lg">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-300">Lightning Fast</span>
        </div>
      </div>

      {/* Supported Wallets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Supported Wallets</h4>
        <div className="grid grid-cols-2 gap-3">
          {wallets.map((wallet, index) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`p-3 rounded-lg border transition-all duration-200 ${getColorClasses(wallet.color)} hover:scale-[1.02]`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{wallet.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {wallet.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {wallet.description}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connect Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <button
          onClick={handleConnectWallet}
          className="w-full flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <Wallet className="w-5 h-5" />
          <span className="font-medium">Connect Your Wallet Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <div className="text-xs text-gray-400 text-center">
          <p>Safe & secure • Non-custodial • Your keys, your crypto</p>
        </div>
      </motion.div>
    </motion.div>
  );
};