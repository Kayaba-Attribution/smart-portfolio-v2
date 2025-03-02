"use client";

import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { Button } from "./ui/button";
import addresses from "@/contracts/addresses.json";
import { ERC20_FAUCET_ABI } from "../abi/erc20Faucet";

export function Faucet() {
  const { account, sendUserOp } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use the sendUserOp helper from AccountContext
      const userOpHash = await sendUserOp({
        contractAddress: addresses.tokens.USDC,
        contractABI: ERC20_FAUCET_ABI,
        functionName: "claimFaucet",
        args: [],
      });

      console.log("Mint transaction completed:", userOpHash);
    } catch (error) {
      console.error("Error minting:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleMint} disabled={isLoading || !account}>
        {isLoading ? "Minting..." : "Get Test Tokens"}
      </Button>
      
      {error && (
        <div className="text-red-500 mt-2 text-sm">{error}</div>
      )}
    </div>
  );
}
