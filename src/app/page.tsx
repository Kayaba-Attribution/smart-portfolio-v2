"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  PlusCircle,
  Share2,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import { Faucet } from "../components/Faucet";
import { useAccount } from "wagmi";
import { PageWrapper } from "@/components/PageWrapper";
import { TokenBalanceDisplay } from "@/components/TokenBalanceDisplay";
import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { Progress } from "@/components/ui/progress";
import { PortfolioChart } from "@/components/PortfolioChart";

// Add the URL conversion utility
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage("");
    }
  }

  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription className="text-destructive">
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        {subscription
          ? "You're currently receiving notifications"
          : "Enable notifications to stay updated"}
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter notification message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  onClick={sendTestNotification}
                  disabled={!message.trim()}
                >
                  Send Test
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={unsubscribeFromPush}
              >
                Unsubscribe from Notifications
              </Button>
            </div>
          </>
        ) : (
          <Button className="w-full" onClick={subscribeToPush}>
            Subscribe to Notifications
          </Button>
        )}
      </CardContent>
      <Faucet />
    </Card>
  );
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null;
  }

  return (
    <Card className="w-[380px] mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Install Our App</CardTitle>
        <CardDescription>
          Get the best experience by installing our app on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {!isIOS && (
          <Button className="w-full" size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add to Home Screen
          </Button>
        )}
        {isIOS && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Share2 className="h-5 w-5" />
              <span>Tap the share button</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PlusCircle className="h-5 w-5" />
              <span>Then select &quot;Add to Home Screen&quot;</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dummy data for portfolio stats
const PORTFOLIO_STATS = {
  totalValue: 12300.45,
  change24h: 3.4,
  lastUpdated: new Date().toLocaleTimeString(),
};

function PortfolioOverview() {
  const { balances, tokens, refreshBalances, isLoading } = useTokenBalances();

  // Calculate total portfolio value
  const totalValue = Object.entries(balances).reduce((acc, [symbol, balance]) => {
    const dummyPrice = symbol === 'USDC' ? 1 : symbol === 'WBTC' ? 40000 : 2000;
    return acc + (parseFloat(balance) * dummyPrice);
  }, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {/* Top Row */}
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

          {/* Bottom Row */}
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

          {/* Refresh Button - Absolute positioned */}
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
    </div>
  );
}

export default function Page() {
  const { address } = useAccount();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (!isStandalone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <InstallPrompt />
      </div>
    );
  }

  return (
    <PageWrapper>
      <PortfolioOverview />
    </PageWrapper>
  );
}
