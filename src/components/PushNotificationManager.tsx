"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  subscribeUser,
  unsubscribeUser,
  sendNotification,
} from "@/app/actions";

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

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [autoNotify, setAutoNotify] = useState(() => {
    // Get initial value from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("autoNotify");
      return saved === null ? true : saved === "true";
    }
    return true;
  });

  // Update localStorage when autoNotify changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoNotify", autoNotify.toString());
    }
  }, [autoNotify]);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
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
      <div className="text-destructive">
        Push notifications are not supported in this browser.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        {subscription
          ? "You're currently receiving notifications"
          : "Enable notifications to stay updated about your transactions"}
      </div>

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
              <Button onClick={sendTestNotification} disabled={!message.trim()}>
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
    </div>
  );
}
