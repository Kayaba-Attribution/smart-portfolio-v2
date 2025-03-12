"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Wallet,
  Briefcase,
} from "lucide-react";
import { Faucet } from "@/components/Faucet";
import { PageWrapper } from "@/components/PageWrapper";
import { TokenBalanceDisplay } from "@/components/TokenBalanceDisplay";
import { PortfolioChart } from "@/components/PortfolioChart";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useAccount } from "@/contexts/AccountContext";
import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { useUI } from "@/contexts/UIContext";
import { useCombinedAssets } from "@/hooks/useCombinedAssets";
import { usePortfolio } from "@/contexts/PortfolioContext";

function LoginOverlay() {
  const {
    registerPasskey,
    loginWithPasskey,
    isLoading: authLoading,
    account,
  } = useAccount();
  const { isLoading: tokenLoading } = useTokenBalances();
  const { isLoading: portfolioLoading } = usePortfolio();
  const [hasAccount, setHasAccount] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [username, setUsername] = useState("");

  // Check for existing account on client-side only
  useEffect(() => {
    const savedAddress = localStorage.getItem("accountAddress");
    setHasAccount(!!savedAddress);
  }, []);

  // Separate loading state calculations:
  // Authentication loading (before login)
  const isAuthLoading = authLoading;

  // Data loading (only after authenticated)
  const isDataLoading = !!account && (tokenLoading || portfolioLoading);

  const handleRegister = async () => {
    try {
      setRegistrationError(null);

      // Validate username
      if (!username.trim()) {
        setRegistrationError("Please enter a username");
        return;
      }

      console.log("Creating new passkey with username:", username);

      // Generate a temp ID as placeholder - will be replaced by wallet address
      const tempId = `temp_${Date.now().toString(36)}`;
      await registerPasskey(tempId, username);
    } catch (error) {
      console.error("Registration failed:", error);

      // Extract the most useful error message
      let errorMessage = "Registration failed";

      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for more specific WebAuthn errors
        if (
          error.message.includes(
            "The operation either timed out or was not allowed"
          )
        ) {
          errorMessage =
            "Registration timed out or was cancelled. Please try again.";
        } else if (error.message.includes("already exists")) {
          errorMessage =
            "This passkey is already registered. Try logging in instead.";
        }
      }

      setRegistrationError(errorMessage);
    }
  };

  const handleLogin = async () => {
    try {
      setRegistrationError(null);
      console.log("Signing in with passkey");

      // Use a placeholder value - the real ID will be resolved during the passkey authentication
      const tempId = `temp_${Date.now().toString(36)}`;
      await loginWithPasskey(tempId);
    } catch (error) {
      console.error("Login failed:", error);

      // Extract the most useful error message
      let errorMessage = "Login failed";

      if (error instanceof Error) {
        errorMessage = error.message;
        // Check for more specific WebAuthn errors
        if (
          error.message.includes(
            "The operation either timed out or was not allowed"
          )
        ) {
          errorMessage = "Login timed out or was cancelled. Please try again.";
        } else if (error.message.includes("not found")) {
          errorMessage = "No passkey found. Please register first.";
        }
      }

      setRegistrationError(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Welcome to Smart Portfolio</CardTitle>
          <CardDescription>
            {hasAccount
              ? "Sign in with your passkey to access your portfolio"
              : "Create a passkey to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {registrationError && (
            <div className="text-red-500 text-sm">{registrationError}</div>
          )}

          {isAuthLoading && (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
              <span>Authenticating...</span>
            </div>
          )}

          {isDataLoading && (
            <div className="flex items-center justify-center py-2 text-sm text-muted-foreground">
              <RefreshCcw className="h-4 w-4 animate-spin mr-2" />
              <span>Loading your portfolio data...</span>
            </div>
          )}

          {hasAccount ? (
            <>
              <Button
                className="w-full"
                size="lg"
                onClick={handleLogin}
                disabled={isAuthLoading || isDataLoading}
              >
                {authLoading ? "Signing in..." : "Sign In with Passkey"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setHasAccount(false)}
              >
                Create New Account
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Choose a Username
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter a username"
                  disabled={isAuthLoading || isDataLoading}
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleRegister}
                disabled={isAuthLoading || isDataLoading}
              >
                {authLoading
                  ? "Creating Account..."
                  : "Create Account with Passkey"}
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setHasAccount(true)}
              >
                I Already Have an Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioOverview() {
  const { refreshBalances, isLoading: tokenLoading } = useTokenBalances();
  const { isLoading: portfolioLoading, fetchPortfolios } = usePortfolio();
  const { accountAddress } = useAccount();
  const { totalAssetValue, totalPortfolioValue, totalWalletValue } =
    useCombinedAssets();

  // Calculate percentage change based on a dummy value (this could be improved with real data)
  const dummyChange = 3.4;

  // Function to refresh all data
  const refreshAllData = async () => {
    await refreshBalances();
    if (accountAddress) await fetchPortfolios();
  };

  // Loading state when we're fetching initial data
  const isLoading = tokenLoading || portfolioLoading;

  if (!accountAddress) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            {/* Portfolio Stats */}
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Portfolio Value
              </div>
              <div
                className={`flex items-center mr-8 ${
                  dummyChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {dummyChange >= 0 ? "+" : "-"}
                {Math.abs(dummyChange)}%{dummyChange >= 0 ? "📈" : "📉"}
              </div>
            </div>

            <div className="flex justify-between items-center">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="text-4xl font-bold">$---.--</div>
                  <div className="animate-spin w-4 h-4">
                    <RefreshCcw className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-bold">
                  $
                  {totalAssetValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Last Updated: <br />
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAllData}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm font-medium">Wallet Assets</span>
                </div>
                <div className="font-semibold">
                  {isLoading ? (
                    <span className="flex items-center space-x-1">
                      <span>$---.--</span>
                      {tokenLoading && (
                        <div className="animate-spin w-3 h-3">
                          <RefreshCcw className="w-3 h-3" />
                        </div>
                      )}
                    </span>
                  ) : (
                    <span>
                      $
                      {totalWalletValue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm font-medium">Portfolio Assets</span>
                </div>
                <div className="font-semibold">
                  {isLoading ? (
                    <span className="flex items-center space-x-1">
                      <span>$---.--</span>
                      {portfolioLoading && (
                        <div className="animate-spin w-3 h-3">
                          <RefreshCcw className="w-3 h-3" />
                        </div>
                      )}
                    </span>
                  ) : (
                    <span>
                      $
                      {totalPortfolioValue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full h-px bg-muted my-2"></div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Value</span>
                <div className="font-bold">
                  {isLoading ? (
                    <span className="flex items-center space-x-1">
                      <span>$---.--</span>
                      <div className="animate-spin w-3 h-3">
                        <RefreshCcw className="w-3 h-3" />
                      </div>
                    </span>
                  ) : (
                    <span>
                      $
                      {totalAssetValue.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PortfolioChart currentValue={totalAssetValue} />
      <div className="text-muted-foreground text-xs text-center italic">
        Disclaimer: Chart displays simulated data and does not represent actual
        historical performance.
      </div>

      <div className="bg-muted/40 rounded-lg p-4 mt-3 mb-5 border border-dashed border-muted-foreground/50">
        <div className="flex items-center justify-between gap-6">
          <div className="text-sm flex-1">
            <h3 className="font-medium mb-1">
              Get Test Tokens for Base Sepolia
            </h3>
            <p className="text-muted-foreground">
              Claim $1000 in test USDC to try all the app features. These tokens
              have no real value and are only available on the testnet.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Faucet />
          </div>
        </div>
      </div>

      <TokenBalanceDisplay />

      <Card>
        <CardHeader>
          <CardTitle>Live Assets Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <Button
                className="aspect-square flex flex-col items-center justify-center p-0 h-20 mb-1 bg-muted/50 hover:bg-muted/70 text-muted-foreground"
                disabled
              >
                <ArrowUpIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Deposit</span>
              </Button>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                className="aspect-square flex flex-col items-center justify-center p-0 h-20 mb-1 bg-muted/50 hover:bg-muted/70 text-muted-foreground"
                disabled
              >
                <ArrowDownIcon className="h-6 w-6 mb-1" />
                <span className="text-xs">Withdraw</span>
              </Button>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>

            <div className="flex flex-col items-center">
              <Button
                className="aspect-square flex flex-col items-center justify-center p-0 h-20 mb-1 bg-muted/50 hover:bg-muted/70 text-muted-foreground"
                disabled
              >
                <RefreshCcw className="h-6 w-6 mb-1" />
                <span className="text-xs">Swap</span>
              </Button>
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AppPage() {
  const { accountAddress, isLoading: accountLoading } = useAccount();
  const { setLoginOverlayVisible } = useUI();

  // Set login overlay visibility based on account
  useEffect(() => {
    if (!accountLoading) {
      setLoginOverlayVisible(!accountAddress);
    }
  }, [accountAddress, accountLoading, setLoginOverlayVisible]);

  // Show loading animation while checking passkeys
  if (accountLoading) {
    return <LoadingAnimation />;
  }

  return (
    <PageWrapper>
      <PortfolioOverview />
      {!accountAddress && <LoginOverlay />}
    </PageWrapper>
  );
}
