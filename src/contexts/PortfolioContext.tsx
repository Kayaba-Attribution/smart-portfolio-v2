"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { formatUnits } from "viem";
import { useAccount } from "@/contexts/AccountContext";
import { useTokenBalances, TOKENS } from "@/contexts/TokenBalanceContext";
import { toast } from "sonner";
import addresses from "@/contracts/addresses.json";
import SMART_PORTFOLIO_ABI from "@/contracts/artifacts/SmartBasket.json";
import { publicClient } from "@/lib/web3";

// Define portfolio types (matching the ones in page.tsx)
interface TokenAllocation {
  tokenAddress: `0x${string}`;
  percentage: number;
  amount: bigint;
}

interface Basket {
  allocations: TokenAllocation[];
  tokenCount: number;
  investmentValue: bigint;
}

export interface PortfolioDetails {
  tokenAddresses: `0x${string}`[];
  tokenPercentages: number[];
  tokenAmounts: bigint[];
  tokenValues: bigint[];
  investmentValue: bigint;
  totalValue: bigint;
}

interface PortfolioContextType {
  portfolios: Basket[];
  portfolioDetails: PortfolioDetails[];
  isLoading: boolean;
  isSellingPortfolio: number | null;
  fetchPortfolios: () => Promise<void>;
  handleSellPortfolio: (portfolioIndex: number) => Promise<void>;
  // Helper functions
  formatValue: (value: bigint, decimals?: number) => string;
  calculateROI: (currentValue: bigint, initialValue: bigint) => string;
  getTokenName: (address: string) => string;
  getTokenSymbol: (address: string) => string;
  getTokenIcon: (address: string) => string | null;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { accountAddress, sendUserOp } = useAccount();
  const { refreshBalances } = useTokenBalances();
  const [portfolios, setPortfolios] = useState<Basket[]>([]);
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSellingPortfolio, setIsSellingPortfolio] = useState<number | null>(
    null
  );

  // Helper functions
  const formatValue = (value: bigint, decimals = 18) => {
    try {
      const formatted = formatUnits(value, decimals);
      return Number(formatted).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error("Error formatting value:", error);
      return "0.00";
    }
  };

  const calculateROI = (currentValue: bigint, initialValue: bigint) => {
    if (initialValue === BigInt(0)) return "0";

    try {
      const initialNum = Number(formatUnits(initialValue, 18));
      const currentNum = Number(formatUnits(currentValue, 18));
      const roi = ((currentNum - initialNum) / initialNum) * 100;
      return roi.toFixed(2);
    } catch (error) {
      console.error("Error calculating ROI:", error);
      return "0";
    }
  };

  const getTokenName = (address: string) => {
    const token = Object.values(TOKENS).find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    return token ? token.name : "Unknown Token";
  };

  const getTokenSymbol = (address: string) => {
    const token = Object.values(TOKENS).find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    return token ? token.symbol : "???";
  };

  const getTokenIcon = (address: string) => {
    const token = Object.values(TOKENS).find(
      (t) => t.address.toLowerCase() === address.toLowerCase()
    );
    return token?.icon || null;
  };

  // Fetch user portfolios
  const fetchPortfolios = useCallback(async () => {
    if (!accountAddress) {
      setIsLoading(false);
      setPortfolios([]);
      setPortfolioDetails([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log("Fetching portfolios for:", accountAddress);

      // Add timeout to prevent hanging on API issues (5 seconds should be enough)
      const portfolioPromise = publicClient.readContract({
        address: addresses.core.SmartPortfolio as `0x${string}`,
        abi: SMART_PORTFOLIO_ABI.abi,
        functionName: "getUserBaskets",
        args: [accountAddress as `0x${string}`],
      });

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Portfolio fetch timed out after 5 seconds"));
        }, 5000);
      });

      // Use Promise.race to handle potential timeouts
      const userBaskets = (await Promise.race([
        portfolioPromise,
        timeoutPromise,
      ])) as Basket[];

      setPortfolios(userBaskets);

      // Get details for each portfolio
      const details: PortfolioDetails[] = [];

      for (let i = 0; i < userBaskets.length; i++) {
        try {
          const assetDetails = (await publicClient.readContract({
            address: addresses.core.SmartPortfolio as `0x${string}`,
            abi: SMART_PORTFOLIO_ABI.abi,
            functionName: "getBasketAssetDetails",
            args: [accountAddress as `0x${string}`, i],
          })) as [string[], bigint[], bigint[], bigint[]];

          const totalValue = (await publicClient.readContract({
            address: addresses.core.SmartPortfolio as `0x${string}`,
            abi: SMART_PORTFOLIO_ABI.abi,
            functionName: "getBasketTotalValue",
            args: [accountAddress as `0x${string}`, i],
          })) as bigint;

          const [tokenAddresses, tokenPercentages, tokenAmounts, tokenValues] =
            assetDetails;

          details.push({
            tokenAddresses: tokenAddresses as `0x${string}`[],
            tokenPercentages: tokenPercentages.map((p) => Number(p)),
            tokenAmounts,
            tokenValues,
            investmentValue: userBaskets[i].investmentValue,
            totalValue,
          });
        } catch (error) {
          console.error(`Error fetching details for portfolio ${i}:`, error);
          // We'll continue with other portfolios even if one fails
        }
      }

      setPortfolioDetails(details);
      console.log(
        "Portfolios loaded:",
        userBaskets.length,
        "Details:",
        details.length
      );
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      // Reset state on error to prevent showing stale data
      setPortfolios([]);
      setPortfolioDetails([]);

      // Only show error toast if it's not a timeout (which might happen regularly)
      if (!(error instanceof Error && error.message.includes("timed out"))) {
        toast.error("Failed to load portfolios");
      }
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
  }, [accountAddress]);

  // Automatically fetch portfolios when account changes or on initial load
  useEffect(() => {
    // Only fetch if we have an account address
    if (accountAddress) {
      console.log("Account detected, loading portfolios automatically");
      fetchPortfolios();
    } else {
      // Make sure to reset loading state when account is not present
      setIsLoading(false);
      setPortfolios([]);
      setPortfolioDetails([]);
    }
  }, [accountAddress, fetchPortfolios]);

  // Sell a portfolio
  const handleSellPortfolio = async (portfolioIndex: number) => {
    if (!accountAddress) return;

    try {
      setIsSellingPortfolio(portfolioIndex);

      const userOpHash = await sendUserOp({
        contractAddress: addresses.core.SmartPortfolio,
        contractABI: SMART_PORTFOLIO_ABI.abi,
        functionName: "sellBasket",
        args: [portfolioIndex],
        onSuccess: async () => {
          // Refresh portfolios and balances after successful sell
          await refreshBalances();
          fetchPortfolios();
          toast.success("Portfolio sold successfully!");
        },
      });

      console.log("Sell transaction sent:", userOpHash);

      toast.promise(
        // This is just for UI feedback, the actual transaction is already sent
        new Promise((resolve) => setTimeout(resolve, 1000)),
        {
          loading: "Selling your portfolio...",
          success: (
            <div>
              Sell transaction initiated
              <a
                href={`https://jiffyscan.xyz/userOpHash/${userOpHash}?network=sepolia`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 underline mt-2 block"
              >
                View Transaction
              </a>
            </div>
          ),
          error: "Failed to sell portfolio",
        }
      );
    } catch (error) {
      console.error("Error selling portfolio:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to sell portfolio"
      );
    } finally {
      setIsSellingPortfolio(null);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolios,
        portfolioDetails,
        isLoading,
        isSellingPortfolio,
        fetchPortfolios,
        handleSellPortfolio,
        formatValue,
        calculateROI,
        getTokenName,
        getTokenSymbol,
        getTokenIcon,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
};
