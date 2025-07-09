// import axios from 'axios';
// import { Connection, PublicKey } from '@solana/web3.js';
// import { TokenPrice, WalletBalance, Transaction, lamportsToSol, weiToEther } from './wallet-utils';

// // API endpoints
// const COINGECKO_API = 'https://api.coingecko.com/api/v3';
// const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
// const ETHEREUM_RPC = 'https://eth-mainnet.alchemyapi.io/v2/demo'; // Use your own key

// // Get token prices from CoinGecko
// export const getTokenPrices = async (tokens: string[]): Promise<TokenPrice> => {
//   try {
//     const tokenIds = tokens.join(',');
//     const response = await axios.get(
//       `${COINGECKO_API}/simple/price?ids=${tokenIds}&vs_currencies=usd&include_24hr_change=true`
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching token prices:', error);
//     return {};
//   }
// };

// // Get Solana balance and tokens
// export const getSolanaBalance = async (address: string): Promise<WalletBalance[]> => {
//   try {
//     const connection = new Connection(SOLANA_RPC);
//     const publicKey = new PublicKey(address);
    
//     // Get SOL balance
//     const solBalance = await connection.getBalance(publicKey);
//     const solInSol = lamportsToSol(solBalance);
    
//     // Get token prices
//     const prices = await getTokenPrices(['solana']);
//     const solPrice = prices.solana?.usd || 0;
    
//     const balances: WalletBalance[] = [
//       {
//         symbol: 'SOL',
//         balance: solInSol.toFixed(6),
//         decimals: 9,
//         usdValue: solInSol * solPrice,
//       }
//     ];

//     // Get token accounts (SPL tokens)
//     try {
//       const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
//         programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
//       });

//       // Common SPL tokens mapping
//       const tokenMap: { [key: string]: { symbol: string; coingeckoId: string } } = {
//         'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', coingeckoId: 'usd-coin' },
//         'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', coingeckoId: 'tether' },
//         'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', coingeckoId: 'bonk' },
//         'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', coingeckoId: 'jupiter' },
//       };

//       const tokenIds = Object.values(tokenMap).map(t => t.coingeckoId);
//       const tokenPrices = await getTokenPrices(tokenIds);

//       for (const accountInfo of tokenAccounts.value) {
//         const parsedInfo = accountInfo.account.data.parsed.info;
//         const tokenAmount = parsedInfo.tokenAmount;
//         const mint = parsedInfo.mint;
        
//         if (tokenAmount.uiAmount > 0) {
//           const tokenInfo = tokenMap[mint];
//           if (tokenInfo) {
//             const price = tokenPrices[tokenInfo.coingeckoId]?.usd || 0;
//             balances.push({
//               symbol: tokenInfo.symbol,
//               balance: tokenAmount.uiAmount.toFixed(6),
//               decimals: tokenAmount.decimals,
//               usdValue: tokenAmount.uiAmount * price,
//               tokenAddress: mint
//             });
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching SPL tokens:', error);
//     }

//     return balances;
//   } catch (error) {
//     console.error('Error fetching Solana balance:', error);
//     return [];
//   }
// };

// // Get Ethereum balance and tokens
// export const getEthereumBalance = async (address: string): Promise<WalletBalance[]> => {
//   try {
//     const provider = (window as any).ethereum;
//     if (!provider) return [];

//     // Get ETH balance
//     const ethBalance = await provider.request({
//       method: 'eth_getBalance',
//       params: [address, 'latest']
//     });
    
//     const ethInEther = weiToEther(ethBalance);
    
//     // Get token prices
//     const prices = await getTokenPrices(['ethereum']);
//     const ethPrice = prices.ethereum?.usd || 0;
    
//     const balances: WalletBalance[] = [
//       {
//         symbol: 'ETH',
//         balance: ethInEther.toFixed(6),
//         decimals: 18,
//         usdValue: ethInEther * ethPrice,
//       }
//     ];

//     // You can add ERC-20 token balance fetching here
//     // For now, we'll just return ETH balance
    
//     return balances;
//   } catch (error) {
//     console.error('Error fetching Ethereum balance:', error);
//     return [];
//   }
// };

// // Get Solana transactions
// export const getSolanaTransactions = async (address: string): Promise<Transaction[]> => {
//   try {
//     const connection = new Connection(SOLANA_RPC);
//     const publicKey = new PublicKey(address);
    
//     // Get recent transactions
//     const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
//     const transactions: Transaction[] = [];
    
//     for (const sig of signatures) {
//       try {
//         const tx = await connection.getTransaction(sig.signature, {
//           commitment: 'confirmed'
//         });
        
//         if (tx) {
//           const preBalance = tx.meta?.preBalances[0] || 0;
//           const postBalance = tx.meta?.postBalances[0] || 0;
//           const balanceChange = postBalance - preBalance;
          
//           transactions.push({
//             hash: sig.signature,
//             type: balanceChange > 0 ? 'receive' : 'send',
//             amount: Math.abs(lamportsToSol(balanceChange)).toFixed(6),
//             symbol: 'SOL',
//             timestamp: (sig.blockTime || 0) * 1000,
//             status: sig.err ? 'failed' : 'confirmed',
//             from: 'Unknown',
//             to: address,
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching transaction details:', error);
//       }
//     }
    
//     return transactions.sort((a, b) => b.timestamp - a.timestamp);
//   } catch (error) {
//     console.error('Error fetching Solana transactions:', error);
//     return [];
//   }
// };

// // Get Ethereum transactions (using Etherscan API)
// export const getEthereumTransactions = async (address: string): Promise<Transaction[]> => {
//   try {
//     // For demo purposes, using a free Etherscan API
//     // In production, use your own API key
//     const response = await axios.get(
//       `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKeyToken`
//     );
    
//     if (response.data.status === '1') {
//       const transactions: Transaction[] = response.data.result.slice(0, 10).map((tx: any) => ({
//         hash: tx.hash,
//         type: tx.to.toLowerCase() === address.toLowerCase() ? 'receive' : 'send',
//         amount: weiToEther(tx.value).toFixed(6),
//         symbol: 'ETH',
//         timestamp: parseInt(tx.timeStamp) * 1000,
//         status: tx.txreceipt_status === '1' ? 'confirmed' : 'failed',
//         from: tx.from,
//         to: tx.to,
//       }));
      
//       return transactions;
//     }
    
//     return [];
//   } catch (error) {
//     console.error('Error fetching Ethereum transactions:', error);
//     return [];
//   }
// };

// // Get wallet balance based on type
// export const getWalletBalance = async (walletId: string, address: string, type: string): Promise<WalletBalance[]> => {
//   switch (type) {
//     case 'solana':
//       return await getSolanaBalance(address);
//     case 'ethereum':
//       return await getEthereumBalance(address);
//     default:
//       return [];
//   }
// };

// // Get wallet transactions based on type
// export const getWalletTransactions = async (walletId: string, address: string, type: string): Promise<Transaction[]> => {
//   switch (type) {
//     case 'solana':
//       return await getSolanaTransactions(address);
//     case 'ethereum':
//       return await getEthereumTransactions(address);
//     default:
//       return [];
//   }
// };