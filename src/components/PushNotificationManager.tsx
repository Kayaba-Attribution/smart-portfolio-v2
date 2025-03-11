"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions";
import { useAccount } from "@/contexts/AccountContext";

// URL conversion utility
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

// Create a serialized subscription from PushSubscription
function serializeSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh || "",
      auth: json.keys?.auth || "",
    },
  };
}

// Helper to manage notified transactions
const NOTIFICATION_STORAGE_KEY = "notified_transactions";
const MAX_TRACKED_TRANSACTIONS = 50;

function getNotifiedTransactions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error getting notified transactions:", error);
    return [];
  }
}

function saveNotifiedTransaction(txHash: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getNotifiedTransactions();
    // Add new hash and keep only the most recent MAX_TRACKED_TRANSACTIONS
    const updated = [...current, txHash].slice(-MAX_TRACKED_TRANSACTIONS);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving notified transaction:", error);
  }
}

function hasBeenNotified(txHash: string): boolean {
  return getNotifiedTransactions().includes(txHash);
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [autoNotify, setAutoNotify] = useState(true);
  const { userOpStatus, userOpHash } = useAccount();

  // Get notification state from localStorage
  const notifiedTransactions = useRef<Set<string>>(
    new Set(getNotifiedTransactions())
  );

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  // Improved transaction notification handler with localStorage persistence
  useEffect(() => {
    // Skip processing if any required condition is not met
    if (!subscription || !autoNotify || !userOpStatus || !userOpHash) return;

    // Skip if we've already notified about this transaction
    if (
      notifiedTransactions.current.has(userOpHash) ||
      hasBeenNotified(userOpHash)
    ) {
      return;
    }

    // Process completed transactions
    if (userOpStatus.includes("completed")) {
      console.log("Sending success notification for:", userOpHash);
      sendNotification(
        serializeSubscription(subscription),
        `Transaction completed! Hash: ${userOpHash.slice(0, 10)}...`
      );

      // Save notification state both in memory and localStorage
      notifiedTransactions.current.add(userOpHash);
      saveNotifiedTransaction(userOpHash);
    }
    // Process failed transactions
    else if (userOpStatus.includes("Error")) {
      console.log("Sending error notification for:", userOpHash);
      sendNotification(
        serializeSubscription(subscription),
        `Transaction failed: ${userOpStatus}`
      );

      // Save notification state both in memory and localStorage
      notifiedTransactions.current.add(userOpHash);
      saveNotifiedTransaction(userOpHash);
    }
  }, [userOpStatus, userOpHash, subscription, autoNotify]);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
      const serializedSub = serializeSubscription(sub);
      await subscribeUser(serializedSub);
    } catch (error) {
      console.error("Failed to subscribe to push:", error);
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser(subscription?.endpoint || "");
    } catch (error) {
      console.error("Failed to unsubscribe from push:", error);
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(serializeSubscription(subscription), message);
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
        <CardDescription>
          {subscription
            ? "You're currently receiving notifications"
            : "Enable notifications to stay updated"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notify on transactions</span>
              <Switch checked={autoNotify} onCheckedChange={setAutoNotify} />
            </div>
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
    </Card>
  );
}
