# ZeroDev Migration Plan

## Current Architecture
- Using OnchainKit for wallet connection and transactions
- Wagmi for contract reads
- Direct contract interactions for faucet
- Manual balance tracking through TokenBalanceContext

## Migration Goals
1. Replace OnchainKit with ZeroDev's smart account infrastructure
2. Create wallet accounts via passkeys:
   - First visit: Create smart account with passkey
   - Return visits: Auto-connect with passkey
   - Store minimal account info (address only)
3. Maintain current functionality:
   - Faucet interaction
   - Token balance tracking
4. Maintain sponsored transactions
5. Future considerations (not initial scope):
   - Email collection and recovery
   - Social login options
   - Advanced session key management

## Immediate Focus

1. **Header Component Migration**
   ```typescript
   // Current (Header.tsx)
   <ConnectWallet /> // OnchainKit

   // New Implementation
   const Header = () => {
     const { createPasskeyAccount, account } = useZeroDev();
     
     useEffect(() => {
       // Auto-connect if account exists
       if (!account && localStorage.getItem('accountAddress')) {
         createPasskeyAccount();
       }
     }, []);

     return (
       // New wallet display UI
       account ? (
         <AccountInfo address={account.address} />
       ) : (
         <CreateAccountButton onClick={createPasskeyAccount} />
       )
     );
   };
   ```

2. **Faucet Component Migration**
   ```typescript
   // Current (Faucet.tsx)
   <Transaction chainId={BASE_SEPOLIA_CHAIN_ID} calls={[...]} />

   // New Implementation
   const Faucet = () => {
     const { kernelClient } = useZeroDev();

     const claimFaucet = async () => {
       try {
         const userOpHash = await kernelClient.sendUserOperation({
           callData: encodeFunctionData({
             abi: ERC20_FAUCET_ABI,
             functionName: "claimFaucet",
           }),
         });
         await handleUserOp(userOpHash);
       } catch (error) {
         handleError(error);
       }
     };

     return (
       <Button onClick={claimFaucet}>
         Claim Tokens
       </Button>
     );
   };
   ```

3. **PWA & Passkey Flow**
   ```typescript
   // In page.tsx
   const HomePage = () => {
     const { account } = useZeroDev();
     const [isStandalone, setIsStandalone] = useState(false);

     // Check if PWA and account exists
     useEffect(() => {
       const isPWA = window.matchMedia('(display-mode: standalone)').matches;
       setIsStandalone(isPWA);

       // If PWA but no account, initiate account creation
       if (isPWA && !account) {
         createPasskeyAccount();
       }
     }, []);

     // Show install prompt if not PWA
     if (!isStandalone) {
       return <InstallPrompt />;
     }

     return <PortfolioView />;
   };
   ```

## Implementation Phases

### Phase 1: Basic Setup & Infrastructure
1. Environment Setup
   ```bash
   # Remove OnchainKit
   npm remove @coinbase/onchainkit
   
   # Install ZeroDev
   npm install @zerodev/sdk @zerodev/wallet viem@latest wagmi@latest
   ```

2. Configuration
   ```typescript
   // config/zerodev.ts
   export const ZERODEV_CONFIG = {
     projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID,
     bundlerUrl: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
   };
   ```

3. Setup ZeroDev Project
   - Create project on ZeroDev dashboard
   - Configure for Base Sepolia
   - Setup gas policies for sponsorship

4. Update Provider Structure
   ```typescript
   // Current
   <OnchainKitProvider>
     <TokenBalanceProvider>
       {children}
     </TokenBalanceProvider>
   </OnchainKitProvider>

   // New
   <WagmiConfig config={wagmiConfig}>
     <ZeroDevProvider projectId={PROJECT_ID}>
       <TokenBalanceProvider>
         {children}
       </TokenBalanceProvider>
     </ZeroDevProvider>
   </WagmiConfig>
   ```

5. Account Address Management
   ```typescript
   // Need to handle address changes
   const { address: smartAccountAddress } = useAccount();
   
   // Update TokenBalanceContext to handle smart account addresses
   useEffect(() => {
     if (smartAccountAddress) {
       // Update balances for new address
       refreshBalances();
     }
   }, [smartAccountAddress]);
   ```

6. Transaction Status Handling
   ```typescript
   // Current
   const handleStatus = async (status: LifecycleStatus) => {
     if (status.statusName === 'success') {
       await refreshBalances();
     }
   };

   // ZeroDev
   const handleUserOp = async (hash: string) => {
     try {
       const receipt = await kernelClient.waitForUserOperationReceipt({
         hash,
         timeout: 30_000,
       });
       if (receipt.success) {
         await refreshBalances();
       }
     } catch (error) {
       // Handle timeout or other errors
     }
   };
   ```

### Phase 2: Core Migration
1. Passkey Setup
   ```typescript
   const createPasskeyAccount = async () => {
     const account = await createPasskeyAccount({
       projectId,
       name: "Smart Portfolio Account",
     });
     localStorage.setItem('accountAddress', account.address);
   };
   ```

2. Balance Tracking Migration
   ```typescript
   // Update TokenBalanceContext to work with smart account
   const { address } = useZeroDev();
   
   useEffect(() => {
     if (address) {
       refreshBalances();
     }
   }, [address]);
   ```

3. Faucet Integration
   ```typescript
   // Convert current faucet interaction to use ZeroDev
   const kernelClient = createKernelAccountClient({
     account,
     chain,
     bundlerTransport: http(BUNDLER_RPC),
     paymaster: zerodevPaymaster,
   });

   const claimFaucet = async () => {
     const userOpHash = await kernelClient.sendUserOperation({
       callData: encodeFunctionData({
         abi: ERC20_FAUCET_ABI,
         functionName: "claimFaucet",
       }),
     });
   };
   ```

4. Transaction Sponsorship Configuration
   ```typescript
   const sponsorUserOp = async (userOp) => {
     const sponsored = await kernelClient.sponsorUserOperation({
       userOp,
       sponsorshipPolicyId: "sp_default", // Your policy ID
     });
     return sponsored;
   };
   ```

5. Enhanced Error Handling
    ```typescript
    try {
      const userOpHash = await kernelClient.sendUserOperation({...});
    } catch (error) {
      if (error.code === "PASSKEY_REJECTED") {
        // User rejected passkey prompt
      } else if (error.code === "BUNDLER_ERROR") {
        // Issue with transaction bundling
      } else if (error.code === "SPONSOR_ERROR") {
        // Handle sponsorship limit reached
      }
    }
    ```

6. State Synchronization
   - Implement optimistic updates
   - Handle transaction failures
   - Manage concurrent transactions

### Phase 4: Essential Features
1. Transaction Sponsorship
   - Configure basic gas policies
   - Implement sponsored transactions

## Future Scope (Post-Migration)
1. Account Enhancement
   - Email collection
   - Recovery setup
   - Session key implementation

2. Feature Enhancement
   - Multi-chain support
   - Advanced transaction management
   - Enhanced error recovery

## Testing Strategy

1. Core Functionality
   - Passkey creation
   - Faucet interaction
   - Balance updates
   - Transaction sponsorship

2. Mobile Testing
   - PWA + Passkey flow
   - Transaction signing

## Migration Risks & Mitigations

1. Risks
   - User account transition
   - Mobile browser compatibility
   - Transaction sponsorship limits
   - Session key security

2. Mitigations
   - Implement gradual rollout
   - Extensive mobile testing
   - Clear sponsorship monitoring
   - Strict session key policies

## Timeline
1. Phase 1: 1 week
2. Phase 2: 1 week
3. Phase 3: 1 week
4. Phase 4: 1 week
5. Testing & Refinement: 1 week

Total Estimated Time: 5 weeks

## Critical Considerations

1. **User Experience**
   - First-time passkey creation flow
   - Transaction confirmation UX differences
   - Loading states and error messages
   - Mobile browser compatibility

2. **Technical Challenges**
   - Smart account address persistence
   - Transaction status tracking
   - Balance update race conditions
   - Gas estimation differences

3. **Security Considerations**
   - Passkey storage and recovery
   - Session key scope limitations
   - Sponsored transaction limits
   - Smart account validation

4. **Browser Support**
   - Chrome/Edge: Full passkey support
   - Safari: iOS 16+ / MacOS Ventura+
   - Firefox: Limited support
   - Fallback strategy for unsupported browsers

5. **Recovery Considerations**
   - Email-based recovery setup
   - Guardian-based social recovery
   - Backup passkey management
   - Account recovery timelock
