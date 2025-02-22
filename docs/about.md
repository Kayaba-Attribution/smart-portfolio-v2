# Smart Portfolio Application Architecture

## ZeroDev Integration Architecture

### Core Components

1. **Configuration (`src/config/zerodev.ts`)**
   ```typescript
   // Core configuration for ZeroDev services
   export const ZERODEV_CONFIG = {
       projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID!,
       bundlerUrl: process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL!,
       paymasterUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_URL!,
       passkeyServerUrl: process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL!,
       chain: baseSepolia,
       entryPoint: getEntryPoint("0.7"),
       kernelVersion: KERNEL_V3_1,
   }
   ```

2. **Passkey Management (`src/lib/passkey.ts`)**
   - Handles account creation and authentication
   - Manages WebAuthn key generation
   - Creates kernel accounts and clients
   - Provides public client for blockchain interactions

3. **Account Context (`src/contexts/AccountContext.tsx`)**
   - Central state management for user accounts
   - Handles account creation and login flows
   - Maintains account status and client instances
   - Provides account information to the application

### Authentication Flow

1. **Initial Setup**
   ```typescript
   // Create public client
   const publicClient = createPublicClient({
       chain: baseSepolia,
       transport: http()
   });
   ```

2. **Account Creation Process**
   - User clicks "Create Account" in Header
   - Generates unique username
   - Creates WebAuthn key
   - Establishes passkey validator
   - Creates kernel account
   - Sets up kernel client

3. **Login Flow**
   - Similar to creation but uses WebAuthnMode.Login
   - Recovers existing account using passkey
   - Reestablishes kernel client connection

### Detailed Authentication Flow

1. **Account Creation Sequence**
   ```typescript
   // 1. User triggers creation in Header.tsx
   const handleConnect = async () => {
     const username = `user_${Date.now()}`; // Generate unique username
     await createPasskeyAccount(username);
   };

   // 2. AccountContext processes request
   const handlePasskeyAccount = async (username: string) => {
     setIsLoading(true);
     try {
       const { account, client } = await createAccountWithPasskey(username);
       localStorage.setItem("accountAddress", account.address);
       setAccount(account);
       setClient(client);
     } catch (err) {
       setError(err instanceof Error ? err : new Error("Failed to create account"));
     }
     setIsLoading(false);
   };

   // 3. Passkey library creates account
   async function createAccountWithPasskey(username: string) {
     // Format username for consistency
     const formattedUsername = formatUsername(username);

     // Create WebAuthn key with register mode
     const webAuthnKey = await toWebAuthnKey({
       passkeyName: formattedUsername,
       passkeyServerUrl: PASSKEY_SERVER_URL,
       mode: WebAuthnMode.Register
     });

     // Create validator for the account
     const validator = await toPasskeyValidator(publicClient, {
       webAuthnKey,
       entryPoint,
       kernelVersion: KERNEL_V3_1,
       validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
     });

     // Create the kernel account
     const account = await createKernelAccount(publicClient, {
       plugins: { sudo: validator },
       entryPoint,
       kernelVersion: KERNEL_V3_1
     });

     // Create client for transactions
     const client = await createKernelAccountClient({
       account,
       chain: baseSepolia,
       bundlerTransport: http(BUNDLER_URL)
     });

     return { account, client };
   }
   ```

2. **Login Flow Details**
   ```typescript
   // 1. Trigger login from UI
   const handleLogin = async (username: string) => {
     await loginWithPasskey(username);
   };

   // 2. Login process in passkey.ts
   async function loginWithPasskey(username: string) {
     const formattedUsername = formatUsername(username);
     
     // Create WebAuthn key in login mode
     const webAuthnKey = await toWebAuthnKey({
       passkeyName: formattedUsername,
       passkeyServerUrl: PASSKEY_SERVER_URL,
       mode: WebAuthnMode.Login
     });

     // Rest of the process similar to creation
     // but uses existing passkey
     ...
   }
   ```

### Provider Architecture

1. **Root Provider (`src/components/providers.tsx`)**
   ```typescript
   export function Providers({ children }: { children: ReactNode }) {
     return (
       <ThemeProvider>
         <AccountProvider>
           <TokenBalanceProvider>
             {children}
           </TokenBalanceProvider>
         </AccountProvider>
       </ThemeProvider>
     );
   }
   ```

2. **Provider Hierarchy**
   - ThemeProvider: UI theme management
   - AccountProvider: Authentication and account management
   - TokenBalanceProvider: Token balance tracking and updates

### Integration Points

1. **Layout Integration (`src/app/layout.tsx`)**
   - Wraps application in providers
   - Manages viewport settings
   - Handles theme initialization

2. **Header Component (`src/components/Header.tsx`)**
   - Primary user interface for account management
   - Displays account status
   - Handles account creation triggers

3. **Token Management**
   - Automatic balance updates on account connection
   - Real-time balance tracking
   - Token price calculations

### Technical Details

1. **Environment Variables**
   ```plaintext
   NEXT_PUBLIC_ZERODEV_BUNDLER_URL
   NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL
   NEXT_PUBLIC_ZERODEV_PROJECT_ID
   ZERODEV_PAYMASTER_URL
   ```

2. **Key Functions**
   ```typescript
   // Account Creation
   async function createAccountWithPasskey(username: string) {
     const webAuthnKey = await toWebAuthnKey({...});
     const validator = await toPasskeyValidator(publicClient, {...});
     const account = await createKernelAccount(publicClient, {...});
     const client = await createKernelAccountClient({...});
     return { account, client };
   }

   // Login
   async function loginWithPasskey(username: string) {
     // Similar flow with WebAuthnMode.Login
   }
   ```

3. **State Management**
   - Account state in AccountContext
   - Token balances in TokenBalanceContext
   - Theme preferences in ThemeContext

### Security Considerations

1. **Passkey Security**
   - WebAuthn standard implementation
   - Biometric authentication support
   - No private key storage
   - Secure key generation and management

2. **Environment Protection**
   - Public vs private variables
   - Secure configuration management
   - Error handling and logging

### Development Guidelines

1. **Error Handling**
   - Comprehensive error catching
   - User feedback mechanisms
   - Logging and debugging support

2. **State Management**
   - Context-based state organization
   - Reactive updates
   - Clean provider hierarchy

3. **Component Integration**
   - Clear separation of concerns
   - Modular architecture
   - Reusable patterns

### Future Enhancements

1. **Account Management**
   - Multiple account support
   - Account recovery mechanisms
   - Enhanced error handling

2. **Security**
   - Additional authentication methods
   - Transaction signing improvements
   - Enhanced error recovery

3. **User Experience**
   - Improved feedback mechanisms
   - Progressive loading states
   - Enhanced error messaging

### Token Balance Management

1. **Balance Tracking Setup**
   ```typescript
   // In TokenBalanceContext
   const refreshBalances = async () => {
     if (!account?.address) return;
     setIsLoading(true);
     
     try {
       const newBalances: TokenBalances = {};
       
       // Parallel balance fetching for all tokens
       await Promise.all(
         Object.entries(TOKENS).map(async ([symbol, token]) => {
           const balance = await publicClient.readContract({
             address: token.address,
             abi: ERC20_ABI.abi,
             functionName: "balanceOf",
             args: [account.address]
           });
           newBalances[symbol] = formatUnits(balance, token.decimals);
         })
       );

       setBalances(newBalances);
     } catch (error) {
       console.error("Error fetching balances:", error);
     } finally {
       setIsLoading(false);
     }
   };
   ```

2. **Token Display Integration**
   ```typescript
   // In TokenBalanceDisplay component
   export function TokenBalanceDisplay() {
     const { tokens, getSortedTokenBalances } = useTokenBalances();
     const sortedBalances = getSortedTokenBalances();

     // Display logic for balances
     return (
       <div>
         {sortedBalances.map(({ symbol, balance, value }) => (
           <div key={symbol}>
             <span>{tokens[symbol].name}</span>
             <span>{balance} {symbol}</span>
             <span>${value.toLocaleString()}</span>
           </div>
         ))}
       </div>
     );
   }
   ```

### Transaction Handling

1. **Transaction Flow**
   ```typescript
   // Example from Faucet component
   const handleMint = async () => {
     if (!account || !client) return;
     
     try {
       setIsLoading(true);
       
       // Simulate transaction first
       const { request } = await publicClient.simulateContract({
         account: account.address,
         address: addresses.faucet,
         abi: FAUCET_ABI.abi,
         functionName: "mint",
       });

       // Send actual transaction
       const hash = await client.sendTransaction(request);
       console.log("Mint transaction:", hash);
     } catch (error) {
       console.error("Error minting:", error);
     } finally {
       setIsLoading(false);
     }
   };
   ```

### State Updates and UI Integration

1. **Account State Changes**
   ```typescript
   // In AccountContext
   useEffect(() => {
     // Auto-connect logic
     const savedAddress = localStorage.getItem("accountAddress");
     if (savedAddress) {
       // Attempt to reconnect
       handleReconnect(savedAddress);
     }
   }, []);
   ```

2. **Balance Updates**
   ```typescript
   // In TokenBalanceContext
   useEffect(() => {
     refreshBalances();
     
     // Optional: Set up polling for updates
     const interval = setInterval(refreshBalances, 30000);
     return () => clearInterval(interval);
   }, [account?.address]);
   ```

### Error Handling Patterns

```typescript
// Standard error handling pattern
try {
  // Async operation
  setIsLoading(true);
  await operation();
} catch (error) {
  // Error handling
  console.error("Operation failed:", error);
  setError(error instanceof Error ? error : new Error("Unknown error"));
} finally {
  // Cleanup
  setIsLoading(false);
}
```

### Configuration Management

1. **Centralized Configuration**
   ```typescript
   // All ZeroDev configuration is managed in one place
   export const ZERODEV_CONFIG = {
       projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID!,
       bundlerUrl: process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL!,
       paymasterUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_URL!,
       passkeyServerUrl: process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL!,
       // ... other configuration
   };
   ```

2. **Environment Validation**
   - Automatic validation of required configuration
   - Early error detection for missing variables
   - Consistent configuration access across the application

3. **Usage Pattern**
   ```typescript
   // Import and use configuration
   import { ZERODEV_CONFIG } from "@/config/zerodev";

   // Configuration is validated on first import
   ZERODEV_CONFIG.validate();

   // Use configuration values
   const client = createKernelAccountClient({
       chain: ZERODEV_CONFIG.chain,
       bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl)
   });
   ```