'use client';

import { Web3Providers } from '@/components/providers/Web3Providers';
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { useEffect, useState } from 'react';

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch dengan ensuring client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

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
    <Web3Providers>
      <WalletProvider>
        {children}
      </WalletProvider>
    </Web3Providers>
  );
}