"use client";

import { useMemo } from "react";
import {
  useTokenBalances,
  TokenBalance as BaseTokenBalance,
  TOKENS,
} from "@/contexts/TokenBalanceContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAccount } from "@/contexts/AccountContext";

// Extend the TokenBalance interface to include address
interface TokenBalance extends BaseTokenBalance {
  address?: `0x${string}`;
}

/**
 * A hook that combines wallet balances with portfolio assets to provide a complete
 * overview of all user assets across different sources.
 */
export function useCombinedAssets() {
  const { portfolioDetails, formatValue } = usePortfolio();
  const { getCombinedTokenBalances } = useTokenBalances();
  const { accountAddress } = useAccount();

  // Calculate portfolio token balances from all portfolios
  const portfolioTokenBalances = useMemo(() => {
    if (!portfolioDetails.length) return {};
    if (!accountAddress) return {};

    console.log(
      "Calculating portfolio token balances for",
      portfolioDetails.length,
      "portfolios"
    );

    const balances: Record<string, TokenBalance> = {};

    // Process each portfolio's tokens
    portfolioDetails.forEach((portfolio, portfolioIndex) => {
      // Skip portfolios with invalid data
      if (
        !portfolio.tokenAddresses ||
        !portfolio.tokenAmounts ||
        !portfolio.tokenValues
      ) {
        console.warn(`Portfolio ${portfolioIndex} has invalid data, skipping`);
        return;
      }

      portfolio.tokenAddresses.forEach((address, i) => {
        // Ensure the address is valid
        if (!address || typeof address !== "string") {
          console.warn(
            `Invalid address in portfolio ${portfolioIndex}, token ${i}`
          );
          return;
        }

        // Find token symbol directly from TOKENS using the address
        const token = Object.values(TOKENS).find(
          (t) => t.address.toLowerCase() === address.toLowerCase()
        );

        // Skip if we don't recognize the token
        if (!token) {
          console.log(
            `Unknown token address: ${address} in portfolio ${portfolioIndex}`
          );
          return;
        }

        const symbol = token.symbol;

        // Ensure we have valid amounts and values
        const tokenAmount = portfolio.tokenAmounts[i] || BigInt(0);
        const tokenValue = portfolio.tokenValues[i] || BigInt(0);

        // Convert amounts to human-readable values with fallbacks
        const amount = formatValue(tokenAmount);
        // Parse to ensure we have a valid number, default to 0 if NaN
        const amountValue = parseFloat(amount) || 0;
        const value = Number(formatValue(tokenValue)) || 0;

        if (isNaN(amountValue) || isNaN(value)) {
          console.warn(
            `Invalid number in portfolio ${portfolioIndex}, token ${symbol}:`,
            { amount, amountValue, value }
          );
        }

        // Add to existing balance or create new entry
        if (balances[symbol]) {
          const existingBalance = parseFloat(balances[symbol].balance) || 0;
          const existingValue = balances[symbol].value || 0;

          balances[symbol] = {
            ...balances[symbol],
            balance: (existingBalance + amountValue).toString(),
            value: existingValue + value,
          };
        } else {
          balances[symbol] = {
            symbol,
            address: token.address,
            balance: amount,
            value,
            source: "portfolio",
          };
        }
      });
    });

    return balances;
  }, [portfolioDetails, formatValue, accountAddress]);

  // Combine wallet and portfolio balances
  const combinedBalances = useMemo(() => {
    // If no account is present, return empty array to avoid processing
    if (!accountAddress) return [];

    const result = getCombinedTokenBalances(portfolioTokenBalances);
    return result;
  }, [getCombinedTokenBalances, portfolioTokenBalances, accountAddress]);

  // Calculate total portfolio value
  const totalPortfolioValue = useMemo(() => {
    if (!portfolioDetails.length) return 0;

    return portfolioDetails.reduce((total, portfolio) => {
      if (!portfolio.totalValue) return total;
      const value = Number(formatValue(portfolio.totalValue)) || 0;
      if (isNaN(value)) {
        console.warn("Invalid portfolio total value:", portfolio.totalValue);
        return total;
      }
      return total + value;
    }, 0);
  }, [portfolioDetails, formatValue]);

  // Calculate total wallet value
  const totalWalletValue = useMemo(() => {
    if (!combinedBalances.length) return 0;

    return combinedBalances
      .filter(
        (asset) => asset.source === "wallet" || asset.source === "combined"
      )
      .reduce((total, asset) => {
        const value = asset.value || 0;
        if (isNaN(value)) {
          console.warn("Invalid wallet asset value:", asset);
          return total;
        }
        return total + value;
      }, 0);
  }, [combinedBalances]);

  // Calculate overall total value
  const totalAssetValue = useMemo(() => {
    if (!combinedBalances.length) return 0;

    return combinedBalances.reduce((total, asset) => {
      const value = asset.totalValue || 0;
      if (isNaN(value)) {
        console.warn("Invalid total asset value:", asset);
        return total;
      }
      return total + value;
    }, 0);
  }, [combinedBalances]);

  return {
    combinedBalances,
    totalPortfolioValue,
    totalWalletValue,
    totalAssetValue,
    hasPortfolios: portfolioDetails.length > 0,
  };
}
