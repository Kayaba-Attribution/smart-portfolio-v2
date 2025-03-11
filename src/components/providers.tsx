'use client';
 
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccountProvider } from "@/contexts/AccountContext";
import { TokenBalanceProvider } from "@/contexts/TokenBalanceContext";
import { UIProvider } from "@/contexts/UIContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();
 
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UIProvider>
          <AccountProvider>
            <TokenBalanceProvider>{children}</TokenBalanceProvider>
          </AccountProvider>
        </UIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}