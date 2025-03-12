"use client";

import { useState } from "react";
import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  ChevronDown,
  ChevronUp,
  Wallet,
  Briefcase,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { useCombinedAssets } from "@/hooks/useCombinedAssets";
import { Badge } from "./ui/badge";

export function TokenBalanceDisplay() {
  const {
    tokens,
    isLoading: tokenLoading,
    refreshBalances,
  } = useTokenBalances();
  const { isLoading: portfolioLoading, fetchPortfolios } = usePortfolio();
  const {
    combinedBalances,
    totalAssetValue,
    totalWalletValue,
    totalPortfolioValue,
  } = useCombinedAssets();
  const [showAll, setShowAll] = useState(false);

  // Combined loading state
  const isLoading = tokenLoading || portfolioLoading;

  // Function to refresh all data
  const refreshAllData = async () => {
    await refreshBalances();
    await fetchPortfolios();
  };

  // Display balances (either all or top 5)
  const displayBalances = showAll
    ? combinedBalances
    : combinedBalances.slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Assets Overview</CardTitle>
          <div className="text-sm font-medium">
            {isLoading ? (
              <span className="flex items-center space-x-1">
                <span>Total: $---.--</span>
                <div className="animate-spin w-3 h-3">
                  <RefreshCcw className="w-3 h-3" />
                </div>
              </span>
            ) : (
              <span>
                Total: $
                {totalAssetValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
        </div>
        <CardDescription className="flex justify-between items-center text-sm pt-1">
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Wallet className="h-3.5 w-3.5 mr-1 text-primary" />
              <span>
                {isLoading && tokenLoading ? (
                  <span className="flex items-center space-x-1">
                    <span>$---.--</span>
                    <div className="animate-spin w-3 h-3">
                      <RefreshCcw className="w-3 h-3" />
                    </div>
                  </span>
                ) : (
                  <span>
                    Wallet: $
                    {totalWalletValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center">
              <Briefcase className="h-3.5 w-3.5 mr-1 text-green-500" />
              <span>
                {isLoading && portfolioLoading ? (
                  <span className="flex items-center space-x-1">
                    <span>$---.--</span>
                    <div className="animate-spin w-3 h-3">
                      <RefreshCcw className="w-3 h-3" />
                    </div>
                  </span>
                ) : (
                  <span>
                    Portfolios: $
                    {totalPortfolioValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={refreshAllData}
              disabled={isLoading}
            >
              <RefreshCcw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCcw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading assets...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {displayBalances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assets found. Use the faucet to get some tokens.
              </div>
            ) : (
              displayBalances.map((asset) => {
                return (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8">
                        {tokens[asset.symbol]?.icon ? (
                          <Image
                            src={tokens[asset.symbol]?.icon || ""}
                            alt={asset.symbol}
                            fill
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {asset.symbol[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium flex items-center">
                          {tokens[asset.symbol]?.name || asset.symbol}
                          {asset.source === "combined" && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs py-0 px-1.5"
                            >
                              Combined
                            </Badge>
                          )}
                          {asset.source === "portfolio" && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs py-0 px-1.5 border-green-500 text-green-500"
                            >
                              Portfolio
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {asset.source === "combined" ? (
                            <span className="flex space-x-2">
                              <span className="flex items-center">
                                <Wallet className="h-3 w-3 mr-1" />
                                {parseFloat(asset.balance).toFixed(4)}
                              </span>
                              <span className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {parseFloat(
                                  asset.portfolioBalance || "0"
                                ).toFixed(4)}
                              </span>
                            </span>
                          ) : (
                            `${parseFloat(asset.balance).toFixed(4)} ${
                              asset.symbol
                            }`
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {asset.source === "combined" ? (
                        <div>
                          <div className="font-medium">
                            $
                            {(asset.totalValue || 0).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="flex flex-col text-xs text-muted-foreground">
                            <span>
                              Wallet: $
                              {(asset.value || 0).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </span>
                            <span>
                              Portfolio: $
                              {(asset.portfolioValue || 0).toLocaleString(
                                undefined,
                                {
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="font-medium">
                          $
                          {(asset.value || 0).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {combinedBalances.length > 5 && (
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    Show Less <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    See All ({combinedBalances.length - 5} more){" "}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 