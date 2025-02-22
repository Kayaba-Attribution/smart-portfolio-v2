# ZeroDev Migration Plan - Revised

## Current Architecture
- Using OnchainKit for wallet connection and transactions
- Wagmi for contract reads
- Direct contract interactions for faucet
- Manual balance tracking through TokenBalanceContext

## Migration Goals
1. Replace OnchainKit with ZeroDev's SDK
2. Create wallet accounts via passkeys:
   - First visit: Create smart account with passkey
   - Return visits: Auto-connect with passkey
3. Maintain current functionality:
   - Faucet interaction
   - Token balance tracking
4. Maintain sponsored transactions

## Implementation Phases

### Phase 1: Core SDK Setup
1. Environment Setup
   ```bash
   # Remove OnchainKit
   npm remove @coinbase/onchainkit
   
   # Install ZeroDev core packages
   npm install @zerodev/sdk @zerodev/passkey-validator viem@latest
   ```

2. Configuration
   ```typescript
   // src/config/zerodev.ts
   import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
   
   export const ZERODEV_CONFIG = {
     projectId: process.env.ZERODEV_PROJECT_ID!,
     bundlerUrl: process.env.ZERODEV_BUNDLER_URL!,
     paymasterUrl: process.env.ZERODEV_PAYMASTER_URL!,
     chain: baseSepolia,
     entryPoint: getEntryPoint("0.7"),
     kernelVersion: KERNEL_V3_1,
   };
   ```

3. Core Client Setup
   ```typescript
   // src/lib/zerodev.ts
   import { 
     createKernelAccount,
     createKernelAccountClient,
     createZeroDevPaymasterClient
   } from "@zerodev/sdk";
   import { http, createPublicClient } from "viem";
   
   export const publicClient = createPublicClient({
     chain: ZERODEV_CONFIG.chain,
     transport: http(ZERODEV_CONFIG.bundlerUrl),
   });

   export const paymasterClient = createZeroDevPaymasterClient({
     chain: ZERODEV_CONFIG.chain,
     transport: http(ZERODEV_CONFIG.paymasterUrl),
   });
   ```

### Phase 2: Passkey Implementation
1. Create Passkey Hook
   ```typescript
   // src/hooks/usePasskeyAccount.ts
   import { toPasskeyValidator, WebAuthnMode } from "@zerodev/passkey-validator";
   
   export function usePasskeyAccount() {
     const createAccount = async (username: string) => {
       const webAuthnKey = await toWebAuthnKey({
         passkeyName: username,
         passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
         mode: WebAuthnMode.Register,
       });

       const validator = await toPasskeyValidator(publicClient, {
         webAuthnKey,
         entryPoint: ZERODEV_CONFIG.entryPoint,
         kernelVersion: ZERODEV_CONFIG.kernelVersion,
       });

       return createKernelAccount(publicClient, {
         plugins: { sudo: validator },
         entryPoint: ZERODEV_CONFIG.entryPoint,
         kernelVersion: ZERODEV_CONFIG.kernelVersion,
       });
     };

     return { createAccount };
   }
   ```

### Phase 3: Core Components Migration

1. Account Provider
   ```typescript
   // src/contexts/AccountContext.ts
   export function AccountProvider({ children }: { children: React.ReactNode }) {
     const [account, setAccount] = useState<KernelAccount | null>(null);
     const [client, setClient] = useState<KernelAccountClient | null>(null);

     // Account creation and management logic
     return (
       <AccountContext.Provider value={{ account, client }}>
         {children}
       </AccountContext.Provider>
     );
   }
   ```

2. Transaction Handler
   ```typescript
   // src/lib/transactions.ts
   export async function sendTransaction(
     client: KernelAccountClient,
     calls: Call[]
   ) {
     const userOpHash = await client.sendUserOperation({
       callData: await client.account.encodeCalls(calls),
     });

     return client.waitForUserOperationReceipt({
       hash: userOpHash,
     });
   }
   ```

### Phase 4: Component Updates

1. Faucet Component
   ```typescript
   // src/components/Faucet.tsx
   export function Faucet() {
     const { client } = useAccount();
     
     const claimFaucet = async () => {
       if (!client) return;
       
       await sendTransaction(client, [{
         to: addresses.tokens.USDC,
         data: encodeFunctionData({
           abi: ERC20_FAUCET_ABI,
           functionName: "claimFaucet",
         }),
       }]);
     };
     
     return <Button onClick={claimFaucet}>Claim Tokens</Button>;
   }
   ```

## Testing Strategy

1. Core Functionality
   - Passkey creation and recovery
   - Transaction sending
   - Balance updates
   - Gas sponsorship

2. Mobile Testing
   - PWA + Passkey flow
   - Transaction signing

## Timeline
1. Phase 1: 2 days
2. Phase 2: 2 days
3. Phase 3: 3 days
4. Phase 4: 2 days
5. Testing: 3 days

Total Estimated Time: 12 days

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
