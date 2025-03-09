"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { formatUnits } from "viem";
import { useAccount } from "./AccountContext"; // Use our ZeroDev account
import { publicClient } from "@/lib/passkey";
import addresses from "../contracts/addresses.json";
import ERC20_ABI from "../contracts/artifacts/ERC20_BASE.json";

// Update Token interface
interface Token {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  name: string;
  icon?: string;
}

// Known tokens with metadata
export const TOKENS: Record<string, Token> = {
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

interface TokenBalances {
  [symbol: string]: string;
}

interface TokenBalanceContextType {
  balances: TokenBalances;
  tokens: Record<string, Token>;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  getSortedTokenBalances: () => Array<{
    symbol: string;
    balance: string;
    value: number;
  }>;
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(
  undefined
);

export function TokenBalanceProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();
  const [balances, setBalances] = useState<TokenBalances>({});
  const [isLoading, setIsLoading] = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      const newBalances: TokenBalances = {};
      const accountAddress = await account.getAddress();

      // Read all token balances in parallel
      await Promise.all(
        Object.entries(TOKENS).map(async ([symbol, token]) => {
          const balance = (await publicClient.readContract({
            address: token.address,
            abi: ERC20_ABI.abi,
            functionName: "balanceOf",
            args: [accountAddress],
          })) as bigint;
          newBalances[symbol] = formatUnits(balance, token.decimals);
        })
      );

      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Refresh balances when account changes
  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

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

  const getSortedTokenBalances = () => {
    return Object.entries(balances)
      .map(([symbol, balance]) => ({
        symbol,
        balance,
        value: parseFloat(balance) * getTokenPrice(symbol),
      }))
      .sort((a, b) => b.value - a.value);
  };

  return (
    <TokenBalanceContext.Provider
      value={{
        balances,
        refreshBalances,
        isLoading,
        tokens: TOKENS,
        getSortedTokenBalances,
      }}
    >
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