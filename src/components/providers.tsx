'use client';
 
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TokenBalanceProvider } from "@/contexts/TokenBalanceContext";
import { AccountProvider } from "@/contexts/AccountContext";
 
export function Providers(props: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AccountProvider>
        <TokenBalanceProvider>{props.children}</TokenBalanceProvider>
      </AccountProvider>
    </ThemeProvider>
  );
}