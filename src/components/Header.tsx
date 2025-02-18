"use client";

import { useAccount } from "@/contexts/AccountContext";
import { Button } from "./ui/button";
import Image from "next/image";

export function Header() {
  const { account, isLoading, error, createPasskeyAccount } = useAccount();

  const handleConnect = async () => {
    try {
      await createPasskeyAccount("Smart Portfolio User");
      console.log("Account created successfully");
    } catch (err) {
      console.error("Failed to create account:", err);
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

            {account ? (
              <div className="flex items-center gap-2">
                <div className="text-sm">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </div>
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