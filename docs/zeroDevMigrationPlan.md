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

### Phase 1: Core SDK Setup ✅
1. Environment Setup
   ```bash
   # Remove OnchainKit
   npm remove @coinbase/onchainkit
   
   # Install ZeroDev core packages
   npm install @zerodev/sdk @zerodev/passkey-validator viem@latest
   ```

2. Environment Variables
   ```env
   # Client-side variables with NEXT_PUBLIC_ prefix
   NEXT_PUBLIC_ZERODEV_PROJECT_ID=your_project_id
   NEXT_PUBLIC_ZERODEV_BUNDLER_URL=https://rpc.zerodev.app/api/v2/bundler/...
   NEXT_PUBLIC_ZERODEV_PAYMASTER_URL=https://rpc.zerodev.app/api/v2/paymaster/...
   NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL=https://passkeys.zerodev.app/api/v3/...
   ```

3. Core Client Setup
   ```typescript
   // src/lib/passkey.ts
   import {
       createKernelAccount,
       createKernelAccountClient,
   } from "@zerodev/sdk";
   import { 
       KERNEL_V3_1,
       getEntryPoint,
   } from "@zerodev/sdk/constants";
   import {
       WebAuthnMode,
       toPasskeyValidator,
       toWebAuthnKey,
       PasskeyValidatorContractVersion
   } from "@zerodev/passkey-validator";
   
   const BUNDLER_URL = process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL!;
   const PASSKEY_SERVER_URL = process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL!;

   export const publicClient = createPublicClient({
       chain: baseSepolia,
       transport: http()
   });
   ```

### Phase 2: Passkey Implementation ✅
1. Passkey Account Creation
   ```typescript
   // src/lib/passkey.ts
   export async function createAccountWithPasskey(username: string) {
       const entryPoint = getEntryPoint("0.7");
       const formattedUsername = formatUsername(username);

       const webAuthnKey = await toWebAuthnKey({
           passkeyName: formattedUsername,
           passkeyServerUrl: PASSKEY_SERVER_URL,
           mode: WebAuthnMode.Register
       });

       const validator = await toPasskeyValidator(publicClient, {
           webAuthnKey,
           entryPoint,
           kernelVersion: KERNEL_V3_1,
           validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
       });

       const account = await createKernelAccount(publicClient, {
           plugins: { sudo: validator },
           entryPoint,
           kernelVersion: KERNEL_V3_1
       });

       const client = await createKernelAccountClient({
           account,
           chain: baseSepolia,
           bundlerTransport: http(BUNDLER_URL)
       });

       return { account, client };
   }
   ```

### Phase 3: Account Context ✅
```typescript
// src/contexts/AccountContext.tsx
interface AccountContextType {
    account: Account | null;  // Using simplified Account type
    client: KernelAccountClient | null;
    isLoading: boolean;
    error: Error | null;
    createPasskeyAccount: (username: string) => Promise<void>;
    loginWithPasskey: (username: string) => Promise<void>;
}

type Account = {
    address: `0x${string}`;
    signMessage?: (args: { message: string }) => Promise<string>;
};
```

### Phase 4: Debug Support ✅
```typescript
// src/components/DebugInfo.tsx
export function DebugInfo() {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs">
            <div>PASSKEY_URL: {process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL}</div>
            <div>BUNDLER_URL: {process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL}</div>
            <div>PROJECT_ID: {process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}</div>
        </div>
    );
}
```

## Next Steps
1. Update Faucet component to use new transaction system
2. Update CreatePortfolio component
3. Implement auto-connect functionality
4. Add transaction status tracking
5. Implement proper error handling and user feedback

## Key Learnings
1. Environment variables must use NEXT_PUBLIC_ prefix for client-side access
2. Simplified Account type works better than SDK types
3. Extensive logging helps debug passkey issues
4. Username formatting is critical for passkey creation

## Testing Strategy
1. Core Functionality
   - ✅ Passkey creation
   - Transaction sending
   - Balance updates

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
