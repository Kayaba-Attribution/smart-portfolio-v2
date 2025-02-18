# Smart Portfolio Application

## Overview
Smart Portfolio is a Progressive Web Application (PWA) built for managing crypto portfolios. It provides real-time token balance tracking, portfolio visualization, and trading capabilities on the Base Sepolia network.

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3 Integration**: 
  - Coinbase's OnchainKit for wallet connection
  - Wagmi for blockchain interactions
  - Viem for smart contract interactions
- **State Management**: React Context
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PWA Features**: Service Worker, Push Notifications

### Key Libraries
- `@coinbase/onchainkit`: Wallet connection and transaction management
- `wagmi`: Ethereum hooks and utilities
- `viem`: Ethereum data types and utilities
- `framer-motion`: Page transitions and animations
- `recharts`: Portfolio visualization
- `web-push`: Push notification functionality

## Architecture

### Core Components
1. **Layout Structure**
   - Header with wallet connection
   - Bottom navigation
   - Main content area with page transitions

2. **Context Providers**
   - ThemeProvider: Dark/Light mode management
   - TokenBalanceProvider: Token balance state management
   - OnchainKitProvider: Web3 functionality

3. **Key Features**
   - Portfolio tracking and visualization
   - Token balance display
   - Faucet integration for test tokens
   - Push notification system
   - PWA installation flow

### Context System

1. **TokenBalanceContext**
   - Central state management for all token balances
   - Implements real-time balance updates using wagmi's useReadContracts
   - Key state:
     ```typescript
     interface TokenBalanceContextType {
       balances: TokenBalances;           // Current token balances
       tokens: Record<string, Token>;     // Token metadata
       isLoading: boolean;               // Loading state
       refreshBalances: () => Promise<void>;
       getSortedTokenBalances: () => Array<{
         symbol: string;
         balance: string;
         value: number;
       }>;
     }
     ```
   - Balance updates flow:
     1. Initial load through useReadContracts
     2. Auto-updates on block changes
     3. Manual refresh after transactions
     4. Propagates updates to all components through context

2. **ThemeContext**
   - Manages application-wide theme state (dark/light)
   - Persists theme preference
   - Provides theme toggle functionality
   - Automatically applies theme classes to root element

3. **Future Contexts (Planned)**
   - **AccountContext**: 
     - Will manage user account state
     - Handle wallet connection status
     - Store user preferences and settings
   - **PortfolioContext**: 
     - Will manage portfolio state
     - Handle basket creation/management
     - Track portfolio performance
     - Manage portfolio transactions

### Web3 Integration Flow

1. **Provider Setup** (`src/components/providers.tsx`)
   ```typescript
   <ThemeProvider>
     <OnchainKitProvider
       apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
       chain={baseSepolia}
     >
       <TokenBalanceProvider>
         {children}
       </TokenBalanceProvider>
     </OnchainKitProvider>
   </ThemeProvider>
   ```

2. **Connection Flow**
   - OnchainKit provides wallet connection via Coinbase's infrastructure
   - Supports multiple wallet types including:
     - Coinbase Wallet
     - MetaMask
     - WalletConnect
   - Auto-connects to previously connected wallets
   - Handles chain switching to Base Sepolia

3. **Layout Integration** (`src/app/layout.tsx`)
   - Wraps entire application in providers
   - Manages viewport settings for mobile
   - Handles PWA-specific layout requirements
   - Implements fixed positioning for mobile optimization

### Web3 Features

1. **Wallet Connection**
   - Implemented through Header component
   - Provides wallet status display
   - Shows connected account information
   - Handles disconnect functionality

2. **Token Balance Management**
   - Automatic balance updates
   - Supports multiple ERC20 tokens
   - Uses wagmi hooks for contract reads
   - Handles decimal formatting

3. **Transaction Management**
   - Uses OnchainKit's Transaction components
   - Provides transaction status updates
   - Handles transaction sponsorship
   - Implements toast notifications for status

4. **Smart Contract Interaction**
   - Uses viem for contract calls
   - Implements ERC20 standard functions
   - Handles contract approvals
   - Manages faucet interactions

### Blockchain Interaction Patterns

1. **Reading from Blockchain** (via TokenBalanceContext)
   ```typescript
   // Using wagmi's useReadContracts for batch balance reading
   const { data: tokenBalances, refetch: refetchAll } = useReadContracts({
     contracts: Object.values(TOKENS).map((token) => ({
       address: token.address,
       abi: ERC20_ABI.abi,
       functionName: "balanceOf",
       args: [userAddress],
     })),
   });
   ```
   - Batch reads all token balances in a single hook
   - Automatically updates on block changes
   - Handles formatting with viem's `formatUnits`
   - Provides refetch capability for manual updates

2. **Writing to Blockchain** (via Faucet Component)
   ```typescript
   // Using OnchainKit's Transaction components
   <Transaction
     chainId={BASE_SEPOLIA_CHAIN_ID}
     calls={[{
       to: tokenAddress,
       data: encodeFunctionData({
         abi: ERC20_FAUCET_ABI,
         functionName: "claimFaucet",
         args: [],
       }),
     }]}
     isSponsored={true}
   >
     <TransactionButton />
     <TransactionToast />
   </Transaction>
   ```
   Key features:
   - Transaction sponsorship support
   - Built-in status tracking
   - Toast notifications
   - Error handling
   - Gas estimation

3. **Transaction Lifecycle**
   ```typescript
   const handleStatus = async (status: LifecycleStatus) => {
     if (status.statusName === 'success') {
       await refreshBalances();  // Update balances after transaction
     }
   };
   ```
   Status flow:
   - Pending: Transaction submitted
   - Mining: Transaction in mempool
   - Success: Transaction confirmed
   - Error: Transaction failed

4. **Contract Interaction Patterns**

   a. **Read Operations**
   ```typescript
   // Single read example
   const { data: balance } = useReadContract({
     address: tokenAddress,
     abi: ERC20_ABI.abi,
     functionName: "balanceOf",
     args: [address],
   });

   // Batch read example (from TokenBalanceContext)
   const { data: balances } = useReadContracts({
     contracts: tokenContracts,
   });
   ```

   b. **Write Operations**
   ```typescript
   // Direct write using wagmi
   const { writeContractAsync } = useWriteContract();
   
   // Example approval transaction
   await writeContractAsync({
     address: tokenAddress,
     abi: ERC20_ABI.abi,
     functionName: "approve",
     args: [spenderAddress, amount],
   });

   // OnchainKit sponsored transaction
   <Transaction
     calls={[{ to: address, data: encodedData }]}
     isSponsored={true}
   />
   ```

5. **Error Handling**
   ```typescript
   try {
     await writeContractAsync(/* ... */);
   } catch (error) {
     if (error.code === 'ACTION_REJECTED') {
       // User rejected transaction
     } else if (error.code === 'INSUFFICIENT_FUNDS') {
       // Not enough funds for gas
     }
     // Handle other errors
   }
   ```

6. **State Updates After Transactions**
   - Listen for transaction status changes
   - Refresh relevant data on success
   - Update UI state accordingly
   - Handle error states
   ```typescript
   const onStatus = async (status: LifecycleStatus) => {
     switch (status.statusName) {
       case 'success':
         await refreshBalances();
         showSuccessToast();
         break;
       case 'error':
         handleError(status.error);
         break;
     }
   };
   ```

### Pages
- `/`: Main portfolio dashboard
- `/trade`: Trading interface with portfolio creation
- `/activity`: Transaction activity tracking
- `/rewards`: Rewards system (planned)
- `/settings`: Application settings

## Development Notes

### Environment Variables Required

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
NEXT_PUBLIC_ONCHAINKIT_API_KEY
```


### Smart Contract Integration
- Uses Base Sepolia testnet
- Integrates with ERC20 tokens and faucet contracts
- Contract addresses managed in `addresses.json`

### PWA Features
- Installable web application
- Push notification support
- Offline capability
- Service worker for caching

### State Management
- Uses React Context for global state
- Token balances managed through TokenBalanceContext
- Theme preferences stored in ThemeContext

### Styling System
- Uses CSS variables for theming
- Responsive design with mobile-first approach
- Custom animations and transitions
- Component library built on shadcn/ui

### Web3 Development Flow

1. **Adding New Tokens**
   ```typescript
   // Add to TOKENS object in TokenBalanceContext
   NEWTOKEN: {
     address: addresses.tokens.NEWTOKEN,
     symbol: "NEWTOKEN",
     name: "New Token",
     decimals: 18,
     icon: "/icons/newtoken-logo.svg",
   }
   ```

2. **Implementing New Contract Interactions**
   - Add contract ABI to `src/abi` directory
   - Add contract address to `addresses.json`
   - Create new contract hooks using wagmi
   - Implement transaction handling

3. **Testing Web3 Features**
   - Test on Base Sepolia testnet
   - Verify contract interactions
   - Test balance updates
   - Verify transaction flows

## Development Workflow

### Adding New Features
1. Create new components in `src/components`
2. Add new pages in `src/app` directory
3. Update navigation in `BottomNav.tsx` if needed
4. Add new context providers if required

### Testing
- Test on both desktop and mobile devices
- Verify PWA installation flow
- Test wallet connection and transactions
- Verify push notification functionality

### Deployment
- Ensure all environment variables are set
- Update contract addresses if needed
- Test PWA manifest and service worker
- Verify Base Sepolia network connectivity

## Future Considerations
- Implementation of swap interface
- Completion of activity feed
- Enhancement of rewards system
- Additional portfolio analytics
- Multi-chain support

### Smart Contract Architecture

1. **Core Contracts**
   - **SmartBasket**: Main portfolio management contract
     - Creates and manages token baskets
     - Handles portfolio rebalancing
     - Integrates with Uniswap for swaps
   - **ERC20 Tokens**: Custom tokens with faucet functionality
     - Built-in faucet for testing
     - Standard ERC20 functionality
     - Access control for minting

2. **Contract Interactions**
   ```typescript
   // Creating a portfolio basket
   const createBasket = async (allocations: TokenAllocation[], usdtAmount: number) => {
     const tx = await smartBasketContract.createBasket(allocations, usdtAmount);
     await tx.wait();
   };

   // Selling a portfolio basket
   const sellBasket = async (basketIndex: number) => {
     const tx = await smartBasketContract.sellBasket(basketIndex);
     await tx.wait();
   };
   ```

3. **Contract Addresses**
   - Managed in `src/contracts/addresses.json`
   - Currently deployed on Base Sepolia
   - Structure:
     ```json
     {
       "core": {
         "Factory": "0x7Ae...",
         "Router": "0x168...",
         "SmartPortfolio": "0xb60..."
       },
       "tokens": {
         "USDC": "0xCE8...",
         "WBASE": "0x180...",
         // ... other tokens
       }
     }
     ```

4. **Multi-chain Support (Planned)**
   - Current: Base Sepolia testnet
   - Future expansion:
     - Multiple EVM chains
     - Chain-specific contract deployments
     - Cross-chain portfolio management

### Contract Features

1. **Portfolio Management**
   - Create baskets with up to 5 tokens
   - Custom allocation percentages
   - Automatic rebalancing
   - Portfolio value tracking

2. **Token Integration**
   - Multiple ERC20 tokens
   - Built-in faucet functionality
   - Price feed integration (planned)
   - Liquidity pool integration

3. **Trading Features**
   - Uniswap V2 integration
   - Swap functionality
   - Liquidity provision
   - Slippage protection

### Development Guidelines

1. **Adding New Contracts**
   ```typescript
   // 1. Add ABI to src/contracts/artifacts
   // 2. Add address to addresses.json
   // 3. Create contract instance
   const newContract = new Contract(address, abi, signer);
   ```

2. **Contract Interaction Pattern**
   ```typescript
   // Reading data
   const balance = await contract.balanceOf(address);
   
   // Writing data with OnchainKit
   <Transaction
     chainId={BASE_SEPOLIA_CHAIN_ID}
     calls={[{
       to: contractAddress,
       data: encodeFunctionData({...})
     }]}
     isSponsored={true}
   />
   ```

3. **Error Handling**
   ```typescript
   try {
     const tx = await contract.method();
     await tx.wait();
   } catch (error) {
     if (error.code === 'ACTION_REJECTED') {
       // User rejected
     } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
       // Contract error
     }
   }
   ```

### State Update Flow

1. **Transaction Updates**
   ```typescript
   // Example from Faucet.tsx
   const handleStatus = async (status: LifecycleStatus) => {
     if (status.statusName === 'success') {
       await refreshBalances();  // Updates all token balances
     }
   };
   ```

2. **Balance Subscription**
   ```typescript
   // In TokenBalanceContext
   useEffect(() => {
     if (address && tokenBalances) {
       const newBalances: TokenBalances = {};
       Object.keys(TOKENS).forEach((symbol, index) => {
         const balance = tokenBalances[index]?.result;
         if (balance !== undefined) {
           newBalances[symbol] = formatUnits(balance, TOKENS[symbol].decimals);
         }
       });
       setBalances(newBalances);
     }
   }, [address, tokenBalances]);
   ```

3. **Component Integration**
   ```typescript
   // Using balances in components
   const { balances, refreshBalances, isLoading } = useTokenBalances();
   
   // Automatic updates when balances change
   useEffect(() => {
     // Component UI updates automatically when balances change
   }, [balances]);
   ```