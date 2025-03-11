"use client";

import { useEffect, useState } from "react";
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
import { useUI } from "@/contexts/UIContext";
import PointsDisplay from "@/components/PointsDisplay";
import { Input } from "@/components/ui/input";
import { AccountDebug } from "@/components/AccountDebug";

// Dummy data for portfolio stats
const PORTFOLIO_STATS = {
  totalValue: 12300.45,
  change24h: 3.4,
  lastUpdated: new Date().toLocaleTimeString(),
};

function LoginOverlay() {
  const { registerPasskey, loginWithPasskey, isLoading } = useAccount();
  const [hasAccount, setHasAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [checkingPasskey, setCheckingPasskey] = useState(true);

  // Check for existing account on client-side only
  useEffect(() => {
    const checkPasskeys = async () => {
      setCheckingPasskey(true);
      try {
        // Import dynamically to avoid server-side issues
        const { checkPasskeyExists } = await import("@/lib/passkey");

        const savedUsername = localStorage.getItem("username");
        if (savedUsername) {
          setLoginUsername(savedUsername);

          // Verify if the passkey actually exists
          const passkeyExists = await checkPasskeyExists(savedUsername);
          setHasAccount(passkeyExists);

          // If no passkey found but localStorage has data, clean it up
          if (!passkeyExists) {
            localStorage.removeItem("accountAddress");
            localStorage.removeItem("username");
          }
        } else {
          setHasAccount(false);
        }
      } catch (error) {
        console.error("Error checking passkeys:", error);
        setHasAccount(false);
      } finally {
        setCheckingPasskey(false);
      }
    };

    checkPasskeys();
  }, []);

  const handleRegister = async () => {
    if (!username || username.trim() === "") {
      setRegistrationError("Username is required");
      return;
    }

    try {
      setRegistrationError(null);
      console.log("Registering with username:", username);
      await registerPasskey(username);
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
            "This username is already registered. Try a different one.";
        }
      }

      setRegistrationError(errorMessage);
    }
  };

  const handleLogin = async () => {
    try {
      if (!loginUsername) {
        setRegistrationError("Username is required");
        return;
      }
      console.log("Logging in with username:", loginUsername);
      setRegistrationError(null);
      await loginWithPasskey(loginUsername);
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
          errorMessage =
            "No passkey found for this username. Please register first.";
        }
      }

      setRegistrationError(errorMessage);
    }
  };

  // Show loading while checking passkeys
  if (checkingPasskey) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
        <Card className="w-[380px]">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Checking for existing passkeys...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <RefreshCcw className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle>Welcome to Smart Portfolio</CardTitle>
          <CardDescription>
            {hasAccount
              ? "Sign in to access your portfolio"
              : "Create an account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {registrationError && (
            <div className="text-red-500 text-sm">{registrationError}</div>
          )}

          {hasAccount ? (
            <>
              <div className="space-y-2">
                <label htmlFor="login-username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="login-username"
                  placeholder="Enter your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In with Passkey"}
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
                <label
                  htmlFor="register-username"
                  className="text-sm font-medium"
                >
                  Choose a Username
                </label>
                <Input
                  id="register-username"
                  placeholder="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  This will be your username for the app
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
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
  const { balances, refreshBalances, isLoading } = useTokenBalances();
  const { accountAddress } = useAccount();

  // Calculate total portfolio value
  const totalValue = Object.entries(balances).reduce(
    (acc, [symbol, balance]) => {
      const dummyPrice =
        symbol === "USDC" ? 1 : symbol === "WBTC" ? 40000 : 2000;
      return acc + parseFloat(balance) * dummyPrice;
    },
    0
  );

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

        {/* Points Display Component */}
        <PointsDisplay />
      </div>

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
      <AccountDebug />
      <PortfolioOverview />
      {!accountAddress && <LoginOverlay />}
    </PageWrapper>
  );
}
