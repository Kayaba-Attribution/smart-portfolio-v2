'use client';
 
import type { ReactNode } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TokenBalanceProvider } from '@/contexts/TokenBalanceContext';
 
export function Providers(props: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={baseSepolia}
      >
        <TokenBalanceProvider>
          {props.children}
        </TokenBalanceProvider>
      </OnchainKitProvider>
    </ThemeProvider>
  );
}