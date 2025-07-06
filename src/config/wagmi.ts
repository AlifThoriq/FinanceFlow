// import { createWeb3Modal } from '@web3modal/wagmi/react'
// import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
// import { WagmiConfig } from 'wagmi'
// import { mainnet, arbitrum, polygon, optimism, base, sepolia } from 'wagmi/chains'

// // 1. Get projectId from environment
// const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!

// if (!projectId) {
//   throw new Error('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set')
// }

// // 2. Create wagmiConfig
// const metadata = {
//   name: 'FinanceFlow',
//   description: 'Your comprehensive financial dashboard',
//   url: 'https://financeflow.com', // replace with your domain
//   icons: ['https://avatars.githubusercontent.com/u/37784886']
// }

// const chains = [mainnet, arbitrum, polygon, optimism, base, sepolia] as const

// export const wagmiConfig = defaultWagmiConfig({
//   chains,
//   projectId,
//   metadata,
//   enableWalletConnect: true,
//   enableInjected: true,
//   enableEIP6963: true,
//   enableCoinbase: true,
// })

// // 3. Create modal
// createWeb3Modal({
//   wagmiConfig,
//   projectId,
//   enableAnalytics: true,
//   enableOnramp: true,
//   themeMode: 'dark',
//   themeVariables: {
//     '--w3m-font-family': 'Geist, sans-serif',
//     '--w3m-accent': '#3b82f6',
//     '--w3m-border-radius-master': '8px',
//   }
// })