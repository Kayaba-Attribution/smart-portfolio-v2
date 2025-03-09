"use client";

import { useAccount } from "@/contexts/AccountContext";
import { Button } from "./ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useUI } from "@/contexts/UIContext";

export function Header() {
  const { account, isLoading, error, registerPasskey, username, logout } =
    useAccount();
  const [accountAddress, setAccountAddress] = useState<string>("");
  const { isLoginOverlayVisible } = useUI();

  useEffect(() => {
    const getAddress = async () => {
      if (account) {
        const addr = await account.getAddress();
        setAccountAddress(addr);
      }
    };
    getAddress();
  }, [account]);

  const handleConnect = async () => {
    try {
      await registerPasskey();
      console.log("Passkey registered successfully");
    } catch (err) {
      console.error("Failed to register passkey:", err);
    }
  };

  // Don't render if login overlay is visible
  if (isLoginOverlayVisible) return null;

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

            {account ? (
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 