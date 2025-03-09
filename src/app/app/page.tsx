"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { Faucet } from "@/components/Faucet";
import { PageWrapper } from "@/components/PageWrapper";
import { TokenBalanceDisplay } from "@/components/TokenBalanceDisplay";
import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { PortfolioChart } from "@/components/PortfolioChart";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useAccount } from "@/contexts/AccountContext";
import { PushNotificationManager } from "@/components/PushNotificationManager";

// Dummy data for portfolio stats
const PORTFOLIO_STATS = {
  totalValue: 12300.45,
  change24h: 3.4,
  lastUpdated: new Date().toLocaleTimeString(),
};

function LoginOverlay() {
  const { registerPasskey, loginWithPasskey, isLoading } = useAccount();
  const hasAccount = !!localStorage.getItem("accountAddress");

  const handleRegister = async () => {
    const username = `user_${Date.now()}`;
    await registerPasskey(username);
  };

  const handleLogin = async () => {
    const username = localStorage.getItem("username");
    if (!username) return;
    await loginWithPasskey(username);
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Welcome to Smart Portfolio</CardTitle>
          <CardDescription>
            {hasAccount
              ? "Sign in to access your portfolio"
              : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasAccount ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In with Passkey"}
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioOverview() {
  const { balances, refreshBalances, isLoading } = useTokenBalances();
  const { account } = useAccount();

  // Calculate total portfolio value
  const totalValue = Object.entries(balances).reduce(
    (acc, [symbol, balance]) => {
      const dummyPrice =
        symbol === "USDC" ? 1 : symbol === "WBTC" ? 40000 : 2000;
      return acc + parseFloat(balance) * dummyPrice;
    },
    0
  );

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CardTitle>Connect Your Account</CardTitle>
        <CardDescription>
          Please connect your account to view your portfolio
        </CardDescription>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {/* Portfolio Stats */}
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Total Portfolio Value
            </div>
            <div
              className={`flex items-center mr-8 ${
                PORTFOLIO_STATS.change24h >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {PORTFOLIO_STATS.change24h >= 0 ? "+" : "-"}
              {Math.abs(PORTFOLIO_STATS.change24h)}%
              {PORTFOLIO_STATS.change24h >= 0 ? "📈" : "📉"}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-4xl font-bold">
              $
              {totalValue.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              Last Updated: <br />
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalances}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <PortfolioChart currentValue={totalValue} />
      <TokenBalanceDisplay />

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <Button className="aspect-square flex flex-col items-center justify-center p-0 h-20">
              <ArrowUpIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Deposit</span>
            </Button>
            <Button className="aspect-square flex flex-col items-center justify-center p-0 h-20">
              <ArrowDownIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">Withdraw</span>
            </Button>
            <Button className="aspect-square flex flex-col items-center justify-center p-0 h-20">
              <RefreshCcw className="h-6 w-6 mb-1" />
              <span className="text-xs">Swap</span>
            </Button>
            <Button className="aspect-square flex flex-col items-center justify-center p-0 h-20">
              <ExternalLink className="h-6 w-6 mb-1" />
              <span className="text-xs">Invest</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PushNotificationManager />
      <Faucet />
    </div>
  );
}

export default function AppPage() {
  const { account, isLoading: accountLoading } = useAccount();

  if (accountLoading) {
    return <LoadingAnimation />;
  }

  return (
    <PageWrapper>
      <PortfolioOverview />
      {!account && <LoginOverlay />}
    </PageWrapper>
  );
}
