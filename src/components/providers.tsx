'use client';
 
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { TokenBalanceProvider } from "@/contexts/TokenBalanceContext";
 
export function Providers(props: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AccountProvider>
        <TokenBalanceProvider>{props.children}</TokenBalanceProvider>
      </AccountProvider>
    </ThemeProvider>
  );
}