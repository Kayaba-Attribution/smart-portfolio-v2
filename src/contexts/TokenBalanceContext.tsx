"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import addresses from "../contracts/addresses.json";

// Update Token interface
interface Token {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
  icon?: string;
}

// Known tokens with metadata
const TOKENS: Record<string, Token> = {
  USDC: {
    address: addresses.tokens.USDC as `0x${string}`,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    icon: "/icons/usdc.svg",
  },
  WBTC: {
    address: addresses.tokens.WBTC as `0x${string}`,
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 18,
    icon: "/icons/wbtc.svg",
  },
  // ... add other tokens similarly
};

const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface TokenBalances {
  [symbol: string]: string;
}

interface TokenBalanceContextType {
  balances: TokenBalances;
  refreshBalances: () => Promise<void>;
  isLoading: boolean;
  tokens: Record<string, Token>;
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(undefined);

export function TokenBalanceProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [balances, setBalances] = useState<TokenBalances>({});
  const [isLoading, setIsLoading] = useState(false);

  // Create contract reads for all tokens
  const { data: tokenBalances, refetch: refetchAll } = useReadContracts({
    contracts: Object.values(TOKENS).map((token) => ({
      address: token.address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: address ? [address as `0x${string}`] : undefined,
    })),
  });

  // Update balances when data changes
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

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      await refetchAll();
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, refetchAll]);

  // Add tokens data to context
  const value = {
    balances,
    refreshBalances,
    isLoading,
    tokens: TOKENS,
  };

  return (
    <TokenBalanceContext.Provider value={value}>
      {children}
    </TokenBalanceContext.Provider>
  );
}

export function useTokenBalances() {
  const context = useContext(TokenBalanceContext);
  if (context === undefined) {
    throw new Error("useTokenBalances must be used within a TokenBalanceProvider");
  }
  return context;
} 