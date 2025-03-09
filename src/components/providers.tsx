'use client';
 
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { TokenBalanceProvider } from "@/contexts/TokenBalanceContext";
import { UIProvider } from "@/contexts/UIContext";
 
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UIProvider>
        <AccountProvider>
          <TokenBalanceProvider>{children}</TokenBalanceProvider>
        </AccountProvider>
      </UIProvider>
    </ThemeProvider>
  );
}