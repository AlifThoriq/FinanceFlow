'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, ExternalLink, Copy, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SolanaWalletConnectProps {
  onWalletConnected?: (address: string, balance: string) => void;
}

export function SolanaWalletConnect({ onWalletConnected }: SolanaWalletConnectProps) {
  const { connection } = useConnection();
  const { publicKey, disconnect, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    }
  }, [connected, publicKey, fetchBalance]);

  useEffect(() => {
    if (connected && publicKey && balance !== null && onWalletConnected) {
      onWalletConnected(publicKey.toString(), (balance / LAMPORTS_PER_SOL).toString());
    }
  }, [connected, publicKey, balance, onWalletConnected]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!connected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Solana Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your Solana wallet to manage your assets
          </p>
          <button
            onClick={() => setVisible(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Wallet className="w-5 h-5" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-6 border border-purple-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">◎</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Solana Wallet</h3>
            <p className="text-gray-400 text-sm">
              {wallet?.adapter.name || 'Solana'}
            </p>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="p-2 hover:bg-red-600/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
          title="Disconnect"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Address */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Address</p>
              <p className="text-white font-mono">
                {formatAddress(publicKey!.toString())}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(publicKey!.toString())}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <a
                href={`https://explorer.solana.com/address/${publicKey!.toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="View on Solana Explorer"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
          {copied && (
            <p className="text-green-400 text-xs mt-1">Copied to clipboard!</p>
          )}
        </div>

        {/* Balance */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-gray-400 text-sm mb-1">Balance</p>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-white font-bold text-xl">
                {balance !== null ? (balance / LAMPORTS_PER_SOL).toFixed(6) : '0.000000'}
              </p>
              <p className="text-gray-400">SOL</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setVisible(true)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl transition-colors"
          >
            Change Wallet
          </button>
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Balance'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}