"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import addresses from "../contracts/addresses.json";

// Define token interface
interface Token {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
}

// Known tokens
const TOKENS: Record<string, Token> = {
  USDC: {
    address: addresses.tokens.USDC as `0x${string}`,
    symbol: "USDC",
    decimals: 18,
  },
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
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(undefined);

export function TokenBalanceProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [balances, setBalances] = useState<TokenBalances>({});
  const [isLoading, setIsLoading] = useState(false);

  const { data: usdcBalance, refetch: refetchUSDC } = useReadContract({
    address: TOKENS.USDC.address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
  });

  // Initial balance load
  useEffect(() => {
    if (address && usdcBalance !== undefined) {
      setBalances(prev => ({
        ...prev,
        USDC: formatUnits(usdcBalance, TOKENS.USDC.decimals),
      }));
    }
  }, [address, usdcBalance]);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const result = await refetchUSDC();
      if (result.data) {
        setBalances(prev => ({
          ...prev,
          USDC: formatUnits(result.data, TOKENS.USDC.decimals),
        }));
      }
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, refetchUSDC]);

  return (
    <TokenBalanceContext.Provider value={{ balances, refreshBalances, isLoading }}>
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