'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { formatEther } from 'viem';
import { Wallet, ExternalLink, Copy, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface EthereumWalletConnectProps {
  onWalletConnected?: (address: string, balance: string) => void;
}

export function EthereumWalletConnect({ onWalletConnected }: EthereumWalletConnectProps) {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  });

  useEffect(() => {
    if (isConnected && address && balance && onWalletConnected) {
      onWalletConnected(address, formatEther(balance.value));
    }
  }, [isConnected, address, balance, onWalletConnected]);

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

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/20"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Connect Ethereum Wallet</h3>
          <p className="text-gray-400 mb-6">
            Connect your Ethereum wallet to manage your assets
          </p>
          <button
            onClick={() => open()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 mx-auto"
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
      className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border border-blue-500/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">⚡</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Ethereum Wallet</h3>
            <p className="text-gray-400 text-sm">
              {chain?.name || 'Ethereum'}
            </p>
          </div>
        </div>
        <button
          onClick={() => disconnect()}
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
                {formatAddress(address!)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(address!)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
              <a
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="View on Etherscan"
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
          {balanceLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-white font-bold text-xl">
                {balance ? parseFloat(formatEther(balance.value)).toFixed(6) : '0.000000'}
              </p>
              <p className="text-gray-400">ETH</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => open()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-colors"
          >
            Open Wallet
          </button>
          <button
            onClick={() => open({ view: 'Networks' })}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-xl transition-colors"
          >
            Switch Network
          </button>
        </div>
      </div>
    </motion.div>
  );
}