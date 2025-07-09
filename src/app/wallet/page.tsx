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
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Settings,
  Star,
  Sparkles
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="relative container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-6 shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Multi-Chain Wallet
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Connect and manage your Ethereum and Solana wallets in one unified dashboard
            </p>
            
            {/* Status Indicator */}
            <div className="mt-8 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isAnyWalletConnected ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-400">
                  {isAnyWalletConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="w-px h-4 bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm text-gray-400">Mainnet</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 pb-16">
        {/* Wallet Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Choose Network</h3>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium transition-colors ${selectedWallet === 'ethereum' ? 'text-blue-400' : 'text-gray-400'}`}>
                  Ethereum
                </span>
                <button
                  onClick={toggleWallet}
                  className="p-1 hover:bg-gray-700 rounded-lg transition-colors group"
                >
                  {selectedWallet === 'ethereum' ? (
                    <ToggleLeft className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <ToggleRight className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  )}
                </button>
                <span className={`text-sm font-medium transition-colors ${selectedWallet === 'solana' ? 'text-purple-400' : 'text-gray-400'}`}>
                  Solana
                </span>
              </div>
            </div>
            
            {/* Network Info */}
            <motion.div 
              key={selectedWallet}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-3 p-4 bg-gray-700/50 rounded-xl border border-gray-600/30"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                selectedWallet === 'ethereum' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}>
                <span className="text-white font-bold text-lg">
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
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-400">
                  {selectedWallet === 'ethereum' ? '4.8' : '4.9'}
                </span>
              </div>
            </motion.div>
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
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {ethereumWallet?.isConnected && solanaWallet?.isConnected ? '2' : '1'}
              </h3>
              <p className="text-gray-400">Connected Wallets</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">Portfolio</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                $0.00
              </h3>
              <p className="text-gray-400">Total Balance</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-medium">24h</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">0</h3>
              <p className="text-gray-400">Transactions</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-orange-400 text-sm font-medium">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {selectedWallet === 'ethereum' ? 'ETH' : 'SOL'}
              </h3>
              <p className="text-gray-400">Network</p>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {isAnyWalletConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Ready</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-200 group border border-gray-600/30 hover:border-blue-500/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                      <ArrowUpRight className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Send Tokens</p>
                      <p className="text-gray-400 text-sm">Transfer to another wallet</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </button>

                <button className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-200 group border border-gray-600/30 hover:border-purple-500/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                      <ArrowDownLeft className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Receive Tokens</p>
                      <p className="text-gray-400 text-sm">Get your wallet address</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </button>

                <button className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-200 group border border-gray-600/30 hover:border-green-500/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                      <Activity className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Transaction History</p>
                      <p className="text-gray-400 text-sm">View all transactions</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                </button>

                <button className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-all duration-200 group border border-gray-600/30 hover:border-yellow-500/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-600/30 transition-colors">
                      <Settings className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Settings</p>
                      <p className="text-gray-400 text-sm">Manage preferences</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h3>
            <p className="text-gray-400 leading-relaxed">
              Your private keys never leave your device. We use industry-standard encryption and security practices.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-400 leading-relaxed">
              Experience lightning-fast transactions with optimized gas fees and instant confirmations.
            </p>
          </div>

          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:bg-gray-800/50 transition-all duration-300 group">
            <div className="w-14 h-14 bg-green-600/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-600/30 transition-colors">
              <Globe className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Chain Support</h3>
            <p className="text-gray-400 leading-relaxed">
              Support for Ethereum and Solana ecosystems with more blockchains coming soon.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}