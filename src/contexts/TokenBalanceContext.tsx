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

export interface TokenBalance {
  symbol: string;
  balance: string;
  value: number;
  portfolioBalance?: string;
  portfolioValue?: number;
  totalBalance?: string;
  totalValue?: number;
  source?: "wallet" | "portfolio" | "combined";
}

interface TokenBalanceContextType {
  balances: TokenBalances;
  tokens: Record<string, Token>;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  getSortedTokenBalances: () => TokenBalance[];
  getCombinedTokenBalances: (
    portfolioBalances?: Record<string, TokenBalance>
  ) => TokenBalance[];
  getTokenPrice: (symbol: string) => number;
}

const TokenBalanceContext = createContext<TokenBalanceContextType | undefined>(
  undefined
);

// Export a function that can be called from anywhere to refresh token balances
export async function refreshTokenBalances() {
  // Dispatch a custom event instead of calling a global function
  const event = new CustomEvent("refresh-token-balances");
  document.dispatchEvent(event);
  return new Promise<void>((resolve) => {
    // Add a one-time listener to resolve the promise when refresh completes
    const completeListener = () => {
      resolve();
      document.removeEventListener(
        "refresh-token-balances-complete",
        completeListener
      );
    };
    document.addEventListener(
      "refresh-token-balances-complete",
      completeListener,
      { once: true }
    );

    // Add a timeout in case the refresh never completes
    setTimeout(() => {
      document.removeEventListener(
        "refresh-token-balances-complete",
        completeListener
      );
      resolve(); // Resolve anyway after timeout
    }, 5000);
  });
}

export function TokenBalanceProvider({ children }: { children: ReactNode }) {
  const { accountAddress } = useAccount();
  const [balances, setBalances] = useState<TokenBalances>({});
  const [isLoading, setIsLoading] = useState(false);

  const refreshBalances = useCallback(async () => {
    if (!accountAddress) {
      console.log("No accountAddress, skipping token balance refresh");
      // Dispatch completion event even when skipping
      document.dispatchEvent(
        new CustomEvent("refresh-token-balances-complete")
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log("Refreshing token balances for", accountAddress);

      // Fetch balances for each token
      const newBalances: TokenBalances = {};

      for (const symbol in TOKENS) {
        try {
          const token = TOKENS[symbol];
          const balance = await publicClient.readContract({
            address: token.address,
            abi: ERC20_ABI.abi,
            functionName: "balanceOf",
            args: [accountAddress as `0x${string}`],
          });

          newBalances[symbol] = formatUnits(balance as bigint, token.decimals);
          console.log(`Updated balance for ${symbol}:`, newBalances[symbol]);
        } catch (tokenError) {
          console.error(`Error fetching ${symbol} balance:`, tokenError);
        }
      }

      setBalances(newBalances);

      // Dispatch event to signal that refresh is complete
      document.dispatchEvent(
        new CustomEvent("refresh-token-balances-complete")
      );
    } catch (error) {
      console.error("Error refreshing token balances:", error);
      // Still signal completion even if there was an error
      document.dispatchEvent(
        new CustomEvent("refresh-token-balances-complete")
      );
    } finally {
      setIsLoading(false);
    }
  }, [accountAddress]);

  // Listen for refresh events instead of using a global variable
  useEffect(() => {
    const handleRefreshEvent = () => {
      refreshBalances();
    };

    document.addEventListener("refresh-token-balances", handleRefreshEvent);

    return () => {
      document.removeEventListener(
        "refresh-token-balances",
        handleRefreshEvent
      );
    };
  }, [refreshBalances]);

  // Refresh balances when accountAddress changes
  useEffect(() => {
    if (accountAddress) {
      refreshBalances();
    }
  }, [accountAddress, refreshBalances]);

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
        source: "wallet" as const,
      }))
      .sort((a, b) => b.value - a.value);
  }, [balances]);

  // Function to combine wallet balances with portfolio assets
  const getCombinedTokenBalances = useCallback(
    (portfolioBalances: Record<string, TokenBalance> = {}) => {
      const walletBalances = getSortedTokenBalances();
      const combinedBalances: Record<string, TokenBalance> = {};

      console.log("Combining wallet balances with portfolio balances");
      console.log(
        "Portfolio balances received:",
        Object.keys(portfolioBalances)
      );

      // First, add all wallet balances to the combined balances
      walletBalances.forEach((tokenBalance) => {
        combinedBalances[tokenBalance.symbol] = {
          ...tokenBalance,
          totalBalance: tokenBalance.balance,
          totalValue: tokenBalance.value,
        };
      });

      // Then, process portfolio balances
      Object.entries(portfolioBalances).forEach(([symbol, portfolioToken]) => {
        // Get clean values with defaults to prevent NaN
        const portfolioBalance = parseFloat(portfolioToken.balance) || 0;
        const portfolioValue = portfolioToken.value || 0;

        console.log(
          `Processing portfolio token ${symbol}: balance=${portfolioBalance}, value=${portfolioValue}`
        );

        if (combinedBalances[symbol]) {
          // This token exists in both wallet and portfolio
          const walletBalance =
            parseFloat(combinedBalances[symbol].balance) || 0;
          const walletValue = combinedBalances[symbol].value || 0;

          const totalBalance = walletBalance + portfolioBalance;
          const totalValue = walletValue + portfolioValue;

          console.log(
            `Combined ${symbol}: wallet=${walletValue}, portfolio=${portfolioValue}, total=${totalValue}`
          );

          combinedBalances[symbol] = {
            ...combinedBalances[symbol],
            portfolioBalance: portfolioToken.balance,
            portfolioValue: portfolioValue,
            totalBalance: totalBalance.toString(),
            totalValue: totalValue,
            source: "combined" as const,
          };
        } else {
          // This token only exists in the portfolio
          console.log(`Portfolio-only ${symbol}: value=${portfolioValue}`);

          combinedBalances[symbol] = {
            ...portfolioToken,
            portfolioBalance: portfolioToken.balance,
            portfolioValue: portfolioValue,
            totalBalance: portfolioToken.balance,
            totalValue: portfolioValue,
            source: "portfolio" as const,
          };
        }
      });

      // Return sorted by total value
      const result = Object.values(combinedBalances).sort(
        (a, b) => (b.totalValue || 0) - (a.totalValue || 0)
      );

      console.log(
        "Combined balances result:",
        result.map((r) => ({
          symbol: r.symbol,
          wallet: r.value || 0,
          portfolio: r.portfolioValue || 0,
          total: r.totalValue || 0,
        }))
      );

      return result;
    },
    [getSortedTokenBalances]
  );

  return (
    <TokenBalanceContext.Provider
      value={{
        balances,
        tokens: TOKENS,
        isLoading,
        refreshBalances,
        getSortedTokenBalances,
        getCombinedTokenBalances,
        getTokenPrice,
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