"use client";

import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { Button } from "./ui/button";
import { publicClient } from "@/lib/passkey";
import addresses from "@/contracts/addresses.json";
import { ERC20_FAUCET_ABI } from "../abi/erc20Faucet";

export function Faucet() {
  const { account, client } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async () => {
    if (!account || !client) return;

    try {
      setIsLoading(true);

      const { request } = await publicClient.simulateContract({
        address: addresses.tokens.USDC as `0x${string}`,
        abi: ERC20_FAUCET_ABI,
        functionName: "claimFaucet",
        args: [],
        account: account.address,
      });
      console.log("Request:", request);

      // https://docs.zerodev.app/sdk/core-api/send-transactions#sending-transactions-1
      // https://github.com/zerodevapp/zerodev-examples/blob/main/send-transactions/send-userop.ts
      const userOpHash = await client.sendUserOperation({
        callData: client.account.encodeCalls([
          {
            to,
            value,
            data,
          },
        ]),
      });

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
