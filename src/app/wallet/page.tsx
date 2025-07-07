'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EthereumWalletConnect } from '@/components/wallet/EthereumWalletConnect';
import { SolanaWalletConnect } from '@/components/wallet/SolanaWalletConnect';
import { useWalletContext, WalletType } from '@/components/wallet/WalletProvider';
import { 
  Wallet, 
  ToggleLeft, 
  ToggleRight, 
  Activity, 
  TrendingUp, 
  DollarSign,
  Users,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';

export default function WalletPage() {
  const {
    selectedWallet,
    setSelectedWallet,
    ethereumWallet,
    solanaWallet,
    isAnyWalletConnected,
  } = useWalletContext();

  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletConnected = (address: string, balance: string) => {
    console.log(`Wallet connected: ${address}, Balance: ${balance}`);
  };

  const toggleWallet = () => {
    setSelectedWallet(selectedWallet === 'ethereum' ? 'solana' : 'ethereum');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Multi-Chain Wallet
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Connect and manage your Ethereum and Solana wallets in one place
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Wallet Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Choose Network</h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${selectedWallet === 'ethereum' ? 'text-blue-400' : 'text-gray-400'}`}>
                  Ethereum
                </span>
                <button
                  onClick={toggleWallet}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {selectedWallet === 'ethereum' ? (
                    <ToggleLeft className="w-6 h-6 text-blue-400" />
                  ) : (
                    <ToggleRight className="w-6 h-6 text-purple-400" />
                  )}
                </button>
                <span className={`text-sm ${selectedWallet === 'solana' ? 'text-purple-400' : 'text-gray-400'}`}>
                  Solana
                </span>
              </div>
            </div>
            
            {/* Network Info */}
            <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedWallet === 'ethereum' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                <span className="text-white font-bold">
                  {selectedWallet === 'ethereum' ? '⚡' : '◎'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {selectedWallet === 'ethereum' ? 'Ethereum Network' : 'Solana Network'}
                </p>
                <p className="text-gray-400 text-sm">
                  {selectedWallet === 'ethereum' 
                    ? 'EVM Compatible • Gas Fees in ETH' 
                    : 'High Speed • Low Fees in SOL'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Wallet Connection */}
        <div className="max-w-2xl mx-auto mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedWallet}
              initial={{ opacity: 0, x: selectedWallet === 'ethereum' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: selectedWallet === 'ethereum' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {selectedWallet === 'ethereum' ? (
                <EthereumWalletConnect onWalletConnected={handleWalletConnected} />
              ) : (
                <SolanaWalletConnect onWalletConnected={handleWalletConnected} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats Cards */}
        {isAnyWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {ethereumWallet?.isConnected && solanaWallet?.isConnected ? '2' : '1'}
              </h3>
              <p className="text-gray-400">Connected Wallets</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">Portfolio</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                ${isAnyWalletConnected ? '0.00' : '0.00'}
              </h3>
              <p className="text-gray-400">Total Balance</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-medium">Recent</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">0</h3>
              <p className="text-gray-400">Transactions</p>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-gray-400">
              Your private keys never leave your device. We use industry-standard security practices.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast</h3>
            <p className="text-gray-400">
              Lightning-fast transactions with optimized gas fees and instant confirmations.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Chain</h3>
            <p className="text-gray-400">
              Support for Ethereum and Solana ecosystems with more chains coming soon.
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        {isAnyWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Send Tokens</p>
                      <p className="text-gray-400 text-sm">Transfer to another wallet</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>

                <button className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Transaction History</p>
                      <p className="text-gray-400 text-sm">View all transactions</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}