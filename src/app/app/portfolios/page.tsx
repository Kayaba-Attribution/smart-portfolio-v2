"use client";

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useAccount } from "@/contexts/AccountContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePortfolio } from "@/contexts/PortfolioContext";

export default function PortfoliosPage() {
  const { accountAddress } = useAccount();
  const {
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
  } = usePortfolio();

  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<
    number | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // View portfolio details
  const viewPortfolioDetails = (index: number) => {
    setSelectedPortfolioIndex(index);
    setDialogOpen(true);
  };

  // Load portfolios on mount and when accountAddress changes
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper>
        <Card>
          <CardContent className="pt-6">
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <div>Loading your portfolios...</div>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // No account state
  if (!accountAddress) {
    return (
      <PageWrapper>
        <Card>
          <CardContent className="pt-6">
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground">
              <div className="mb-2">
                Connect your account to view portfolios
              </div>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  // No portfolios state
  if (portfolios.length === 0) {
    return (
      <PageWrapper>
        <Card>
          <CardHeader>
            <CardTitle>Your Portfolios</CardTitle>
            <CardDescription>
              You don&apos;t have any portfolios yet. Create one in the Trade
              section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/app/trade")}
              >
                Create Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Portfolios</CardTitle>
              <CardDescription>
                Manage your investment portfolios
              </CardDescription>
            </div>
            <div className="text-sm bg-muted px-3 py-1 rounded-full">
              Total: {portfolios.length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">
                    Portfolio Assets
                  </TableHead>
                  <TableHead className="w-[45%]">Performance</TableHead>
                  <TableHead className="text-right w-[20%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioDetails.map((portfolio, index) => (
                  <TableRow key={index}>
                    {/* Column 1: Portfolio Composition */}
                    <TableCell>
                      <div className="flex flex-col gap-3">
                        <div className="flex -space-x-1.5">
                          {portfolio.tokenAddresses.map((address, i) => (
                            <div
                              key={i}
                              className="relative h-7 w-7 rounded-full border-2 border-background"
                              title={getTokenName(address)}
                            >
                              {getTokenIcon(address) ? (
                                <Image
                                  src={getTokenIcon(address)!}
                                  alt={getTokenSymbol(address)}
                                  fill
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="h-full w-full bg-muted rounded-full flex items-center justify-center">
                                  {getTokenSymbol(address).charAt(0)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div>
                          {portfolio.tokenAddresses.map((address, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 mb-1"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: [
                                    "#3498db",
                                    "#2ecc71",
                                    "#e74c3c",
                                    "#f39c12",
                                    "#9b59b6",
                                  ][i % 5],
                                }}
                              />
                              <span className="text-sm">
                                <span className="font-medium">
                                  {getTokenSymbol(address)}
                                </span>
                                <span className="text-muted-foreground ml-1">
                                  {portfolio.tokenPercentages[i]}%
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 2: Performance */}
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                          <div className="text-sm text-muted-foreground">
                            Value
                          </div>
                          <div className="text-lg font-semibold">
                            ${formatValue(portfolio.totalValue)}
                          </div>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <div className="text-sm text-muted-foreground">
                            Initial
                          </div>
                          <div className="text-sm">
                            ${formatValue(portfolio.investmentValue)}
                          </div>
                        </div>

                        <div
                          className={`flex items-center justify-center gap-1 py-1 px-2 rounded-md ${
                            Number(
                              calculateROI(
                                portfolio.totalValue,
                                portfolio.investmentValue
                              )
                            ) >= 0
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {Number(
                            calculateROI(
                              portfolio.totalValue,
                              portfolio.investmentValue
                            )
                          ) >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="font-medium">
                            {calculateROI(
                              portfolio.totalValue,
                              portfolio.investmentValue
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Column 3: Actions */}
                    <TableCell className="text-right">
                      <div className="flex flex-col gap-2 items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => viewPortfolioDetails(index)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleSellPortfolio(index)}
                          disabled={isSellingPortfolio === index}
                        >
                          {isSellingPortfolio === index ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Sell"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Details Dialog - Improved UI */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Portfolio Details</DialogTitle>
            <DialogDescription>
              Complete breakdown of your portfolio assets
            </DialogDescription>
          </DialogHeader>

          {selectedPortfolioIndex !== null &&
            portfolioDetails[selectedPortfolioIndex] && (
              <div className="py-3 overflow-y-auto pr-1">
                {/* Creation Time and Market Info */}
                <div className="flex justify-between mb-5 text-sm text-muted-foreground">
                  <div>Created {new Date().toLocaleDateString()}</div>
                  <div className="flex items-center">
                    <span className="mr-1">Market volatility:</span>
                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-medium">
                      Medium
                    </span>
                  </div>
                </div>

                {/* Performance Overview Card */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Initial Investment
                    </div>
                    <div className="text-lg font-bold">
                      $
                      {formatValue(
                        portfolioDetails[selectedPortfolioIndex].investmentValue
                      )}
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">
                      Current Value
                    </div>
                    <div className="text-lg font-bold">
                      $
                      {formatValue(
                        portfolioDetails[selectedPortfolioIndex].totalValue
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      Number(
                        calculateROI(
                          portfolioDetails[selectedPortfolioIndex].totalValue,
                          portfolioDetails[selectedPortfolioIndex]
                            .investmentValue
                        )
                      ) >= 0
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      Return on Investment
                    </div>
                    <div
                      className={`text-lg font-bold flex items-center ${
                        Number(
                          calculateROI(
                            portfolioDetails[selectedPortfolioIndex].totalValue,
                            portfolioDetails[selectedPortfolioIndex]
                              .investmentValue
                          )
                        ) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {Number(
                        calculateROI(
                          portfolioDetails[selectedPortfolioIndex].totalValue,
                          portfolioDetails[selectedPortfolioIndex]
                            .investmentValue
                        )
                      ) >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {calculateROI(
                        portfolioDetails[selectedPortfolioIndex].totalValue,
                        portfolioDetails[selectedPortfolioIndex].investmentValue
                      )}
                      %
                    </div>
                  </div>
                </div>

                {/* Visual Asset Allocation */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2 flex justify-between">
                    <span>Asset Allocation</span>
                    <span className="text-xs text-muted-foreground">
                      Diversity Score: 8.2/10
                    </span>
                  </div>
                  <div className="flex h-3 w-full rounded-full overflow-hidden">
                    {portfolioDetails[
                      selectedPortfolioIndex
                    ].tokenPercentages.map((percentage, i) => (
                      <div
                        key={i}
                        className="h-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: [
                            "#3498db",
                            "#2ecc71",
                            "#e74c3c",
                            "#f39c12",
                            "#9b59b6",
                          ][i % 5],
                        }}
                        title={`${getTokenName(
                          portfolioDetails[selectedPortfolioIndex]
                            .tokenAddresses[i]
                        )}: ${percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {portfolioDetails[
                      selectedPortfolioIndex
                    ].tokenAddresses.map((address, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md"
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: [
                              "#3498db",
                              "#2ecc71",
                              "#e74c3c",
                              "#f39c12",
                              "#9b59b6",
                            ][i % 5],
                          }}
                        />
                        <span className="text-xs font-medium">
                          {getTokenSymbol(address)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {
                            portfolioDetails[selectedPortfolioIndex]
                              .tokenPercentages[i]
                          }
                          %
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portfolio Insights Section */}
                <div className="mb-5">
                  <div className="text-sm font-medium mb-3">
                    Portfolio Insights
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        Performance vs Market
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        Outperforming by 2.34%
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        Dominant Sector
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        DeFi (42%)
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        Risk Level
                      </div>
                      <div className="text-sm font-semibold mt-1">Moderate</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        Suggested Action
                      </div>
                      <div className="text-sm font-semibold mt-1">Hold</div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-3 text-xs text-muted-foreground italic border-l-2 border-muted-foreground/20 pl-3 py-1">
                    <span className="font-medium">Note:</span> Diversity score,
                    market volatility, creation date, and portfolio insights are
                    simulated for demonstration purposes only. Actual analytics
                    will be available in future updates.
                  </div>
                </div>

                {/* Token Details Table */}
                <div className="mb-5">
                  <div className="text-sm font-medium mb-2">Token Details</div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {portfolioDetails[
                        selectedPortfolioIndex
                      ].tokenAddresses.map((address, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="relative h-6 w-6 rounded-full">
                                {getTokenIcon(address) ? (
                                  <Image
                                    src={getTokenIcon(address)!}
                                    alt={getTokenSymbol(address)}
                                    fill
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted rounded-full flex items-center justify-center text-xs">
                                    {getTokenSymbol(address).charAt(0)}
                                  </div>
                                )}
                              </div>
                              <span>{getTokenName(address)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatValue(
                              portfolioDetails[selectedPortfolioIndex]
                                .tokenAmounts[i]
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            $
                            {formatValue(
                              portfolioDetails[selectedPortfolioIndex]
                                .tokenValues[i]
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end sticky bottom-0 pt-4 mt-2 bg-background z-10 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleSellPortfolio(selectedPortfolioIndex);
                      setDialogOpen(false);
                    }}
                    disabled={isSellingPortfolio === selectedPortfolioIndex}
                  >
                    {isSellingPortfolio === selectedPortfolioIndex ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Selling...
                      </>
                    ) : (
                      "Sell Portfolio"
                    )}
                  </Button>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
} 