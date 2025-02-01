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
    icon: "/icons/usd-coin-usdc-logo.svg",
  },
  WBASE: {
    address: addresses.tokens.WBASE as `0x${string}`,
    symbol: "WBASE",
    name: "Wrapped Base",
    decimals: 18,
    icon: "/icons/ethereum-eth-logo.svg",
  },
  WBTC: {
    address: addresses.tokens.WBTC as `0x${string}`,
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 18,
    icon: "/icons/bitcoin-btc-logo.svg",
  },
  XRP: {
    address: addresses.tokens.XRP as `0x${string}`,
    symbol: "XRP",
    name: "Ripple",
    decimals: 18,
    icon: "/icons/xrp-xrp-logo.svg",
  },
  UNI: {
    address: addresses.tokens.UNI as `0x${string}`,
    symbol: "UNI",
    name: "Uniswap",
    decimals: 18,
    icon: "/icons/uniswap-uni-logo.svg",
  },
  LINK: {
    address: addresses.tokens.LINK as `0x${string}`,
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    icon: "/icons/chainlink-link-logo.svg",
  },
  DOGE: {
    address: addresses.tokens.DOGE as `0x${string}`,
    symbol: "DOGE",
    name: "Dogecoin",
    decimals: 18,
    icon: "/icons/dogecoin-doge-logo.svg",
  },
  SHIB: {
    address: addresses.tokens.SHIB as `0x${string}`,
    symbol: "SHIB",
    name: "Shiba Inu",
    decimals: 18,
    icon: "/icons/shiba-inu-shib-logo.svg",
  },
  PEPE: {
    address: addresses.tokens.PEPE as `0x${string}`,
    symbol: "PEPE",
    name: "Pepe",
    decimals: 18,
    icon: "/icons/pepe-pepe-logo.svg",
  },
  FLOKI: {
    address: addresses.tokens.FLOKI as `0x${string}`,
    symbol: "FLOKI",
    name: "Floki",
    decimals: 18,
    icon: "/icons/floki-inu-floki-logo.svg",
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
  tokens: Record<string, Token>;
  getSortedTokenBalances: () => { symbol: string; balance: string; value: number }[];
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

  // Add function to get token values (you can replace these dummy prices with real ones later)
  const getTokenPrice = (symbol: string) => {
    const dummyPrices: Record<string, number> = {
      USDC: 1,
      WBTC: 40000,
      WBASE: 2000,
      // Add other token prices as needed
      XRP: 0.5,
      UNI: 5,
      LINK: 15,
      DOGE: 0.1,
      SHIB: 0.00001,
      PEPE: 0.000001,
      FLOKI: 0.0001,
    };
    return dummyPrices[symbol] || 0;
  };

  const getSortedTokenBalances = useCallback(() => {
    return Object.entries(balances)
      .map(([symbol, balance]) => ({
        symbol,
        balance,
        value: parseFloat(balance) * getTokenPrice(symbol),
      }))
      .sort((a, b) => b.value - a.value);
  }, [balances]);

  // Update the context value
  const value = {
    balances,
    refreshBalances,
    isLoading,
    tokens: TOKENS,
    getSortedTokenBalances,
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