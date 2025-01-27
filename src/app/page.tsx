"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusCircle, Share2 } from "lucide-react";


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
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
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
        <CardDescription>
          {subscription 
            ? "You're currently receiving notifications" 
            : "Enable notifications to stay updated"}
        </CardDescription>
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
          <Button 
            className="w-full" 
            onClick={subscribeToPush}
          >
            Subscribe to Notifications
          </Button>
        )}
      </CardContent>
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

export default function Page() {
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
    <div className="container mx-auto p-4">
      <PushNotificationManager />
    </div>
  );
}
