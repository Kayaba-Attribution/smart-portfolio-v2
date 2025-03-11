"use client";

import { useAccount } from "@/contexts/AccountContext";
import { Button } from "./ui/button";
import Image from "next/image";
import { useUI } from "@/contexts/UIContext";
import { Loader2 } from "lucide-react";

export function Header() {
  const { account, accountAddress, isLoading, error, username, logout } =
    useAccount();
  const { isLoginOverlayVisible } = useUI();

  // Don't render if login overlay is visible
  if (isLoginOverlayVisible) return null;

  const handleConnect = async () => {
    try {
      // This is where we'd normally call registerPasskey, but it's better
      // handled by the loginOverlay component now
      console.log("Connect button clicked");
    } catch (err) {
      console.error("Failed to connect:", err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-50">
      <div className="container h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <Image
              src="/SP_LOGO.png"
              alt="Smart Portfolio"
              width={140}
              height={28}
            />
          </div>

          <div>
            {error && (
              <div className="text-red-500 text-sm mr-4">{error.message}</div>
            )}

            {account && accountAddress ? (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  {username && <span className="mr-2">{username}</span>}
                  {accountAddress &&
                    `${accountAddress.slice(0, 6)}...${accountAddress.slice(
                      -4
                    )}`}
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 