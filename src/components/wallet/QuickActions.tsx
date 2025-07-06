'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  RefreshCw as SwapIcon, 
  Plus, 
  Zap,
  ArrowUpRight,
  ArrowDownUp
} from 'lucide-react';
import { WalletInfo } from '../../lib/wallet-utils';

interface QuickActionsProps {
  wallets: WalletInfo[];
  onSendCrypto: () => void;
  onSwapTokens: () => void;
  onConnectWallet: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  wallets,
  onSendCrypto,
  onSwapTokens,
  onConnectWallet
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'send',
      title: 'Send Crypto',
      description: 'Transfer tokens to another wallet',
      icon: Send,
      color: 'from-blue-600 to-blue-800',
      hoverColor: 'from-blue-500 to-blue-700',
      onClick: onSendCrypto,
      disabled: wallets.length === 0
    },
    {
      id: 'swap',
      title: 'Swap Tokens',
      description: 'Exchange one token for another',
      icon: ArrowDownUp,
      color: 'from-purple-600 to-purple-800',
      hoverColor: 'from-purple-500 to-purple-700',
      onClick: onSwapTokens,
      disabled: wallets.length === 0
    },
    {
      id: 'connect',
      title: 'Connect Another',
      description: 'Add another wallet to your portfolio',
      icon: Plus,
      color: 'from-green-600 to-green-800',
      hoverColor: 'from-green-500 to-green-700',
      onClick: onConnectWallet,
      disabled: false
    }
  ];

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <div className="flex items-center space-x-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-gray-400">Fast & Secure</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isHovered = hoveredAction === action.id;
          
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={action.onClick}
              disabled={action.disabled}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
              className={`relative group overflow-hidden rounded-xl p-6 text-left transition-all duration-300 ${
                action.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 hover:shadow-xl cursor-pointer'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${
                isHovered && !action.disabled ? action.hoverColor : action.color
              } transition-all duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-white/10 ${
                    isHovered && !action.disabled ? 'bg-white/20' : ''
                  } transition-all duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  {!action.disabled && (
                    <ArrowUpRight className={`w-5 h-5 text-white/60 transition-all duration-300 ${
                      isHovered ? 'text-white transform translate-x-1 -translate-y-1' : ''
                    }`} />
                  )}
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {action.title}
                  </h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                
                {action.disabled && (
                  <div className="mt-4 text-xs text-white/50">
                    Connect a wallet first
                  </div>
                )}
              </div>
              
              {/* Animated background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transition-all duration-700 ${
                isHovered && !action.disabled 
                  ? 'translate-x-full' 
                  : '-translate-x-full'
              }`} />
            </motion.button>
          );
        })}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{wallets.length}</div>
            <div className="text-xs text-gray-400">Connected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">100%</div>
            <div className="text-xs text-gray-400">Secure</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">24/7</div>
            <div className="text-xs text-gray-400">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
};