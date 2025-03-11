"use client";

import { useEffect, useRef, useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { sendNotification } from "@/app/actions";
import { refreshTokenBalances } from "@/contexts/TokenBalanceContext";

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
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error getting notified transactions:", error);
    return [];
  }
}

function saveNotifiedTransaction(txHash: string): void {
  if (typeof window === "undefined") return;
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

// Get autoNotify setting from localStorage
function getAutoNotifySetting(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const setting = localStorage.getItem("autoNotify");
    return setting === null ? true : setting === "true";
  } catch (error) {
    return true;
  }
}

export function PushNotificationService() {
  const { userOpStatus, userOpHash } = useAccount();

  // Get notification state from localStorage
  const notifiedTransactions = useRef<Set<string>>(
    new Set(getNotifiedTransactions())
  );

  // Service worker and subscription state
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  // Track the last completed transaction to handle balance refreshing
  const lastCompletedTxRef = useRef<string | null>(null);

  // Register service worker on component mount
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      registerServiceWorker();
    }
  }, []);

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

  // Handle balance refreshing on transaction completion
  useEffect(() => {
    // Skip if not a completed transaction or already handled this transaction
    if (!userOpStatus || !userOpHash || !userOpStatus.includes("completed"))
      return;
    if (lastCompletedTxRef.current === userOpHash) return;

    // Update the last completed transaction
    lastCompletedTxRef.current = userOpHash;

    // Refresh token balances
    console.log(
      "Refreshing token balances after transaction in PushNotificationService"
    );
    refreshTokenBalances()
      .then(() => console.log("Balances refreshed successfully"))
      .catch((error) => console.error("Error refreshing balances:", error));
  }, [userOpStatus, userOpHash]);

  // Improved transaction notification handler with localStorage persistence
  useEffect(() => {
    // Skip processing if any required condition is not met
    if (!subscription || !userOpStatus || !userOpHash) return;

    // Check if user has enabled notifications
    const autoNotify = getAutoNotifySetting();
    if (!autoNotify) return;

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
  }, [userOpStatus, userOpHash, subscription]);

  // No UI - this is a background service
  return null;
}
