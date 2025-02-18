"use client";

import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { Button } from "./ui/button";
import { publicClient } from "@/lib/passkey";
import addresses from "@/contracts/addresses.json";
import FAUCET_ABI from "@/contracts/artifacts/SmartBasket.json";

export function Faucet() {
  const { account, client } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async () => {
    if (!account || !client) return;

    try {
      setIsLoading(true);

      const { request } = await publicClient.simulateContract({
        account: account.address,
        address: addresses.faucet as `0x${string}`,
        abi: FAUCET_ABI.abi,
        functionName: "mint",
      });

      const hash = await client.sendTransaction(request);
      console.log("Mint transaction:", hash);
    } catch (error) {
      console.error("Error minting:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleMint} disabled={isLoading || !account}>
      {isLoading ? "Minting..." : "Get Test Tokens"}
    </Button>
  );
}
