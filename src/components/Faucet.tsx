"use client";

import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { useTokenBalances } from "@/contexts/TokenBalanceContext";
import { Button } from "./ui/button";
import addresses from "@/contracts/addresses.json";
import { ERC20_FAUCET_ABI } from "../abi/erc20Faucet";
import { POINTS_ACTIONS } from "@/lib/pointsActions";
import { addPoints, db, getUserQuery } from "@/lib/db";
import { toast } from "sonner";
import { ZERODEV_CONFIG } from "@/config/zerodev";

export function Faucet() {
  const { account, sendUserOp, accountAddress } = useAccount();
  const { refreshBalances } = useTokenBalances();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the user profile data using getUserQuery
  const { data: userData, isLoading: isLoadingProfile } = accountAddress
    ? db.useQuery(getUserQuery(accountAddress))
    : { data: null, isLoading: false };

  console.log("Query debug - address:", accountAddress);
  console.log("Query debug - full response:", userData);

  const userProfile = userData?.userProfiles?.[0];
  const currentPoints = userProfile?.totalPoints ?? 0;

  const handleMint = async () => {
    if (!account || !accountAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      // Use the sendUserOp helper from AccountContext
      const userOpHash = await sendUserOp({
        contractAddress: addresses.tokens.USDC,
        contractABI: ERC20_FAUCET_ABI,
        functionName: "claimFaucet",
        args: [],
        onSuccess: async () => {
          // Refresh balances after successful transaction
          await refreshBalances();

          // Award points for using the faucet - get user profile from query data
          try {
            if (!userProfile) {
              console.error(
                "User profile not found for address:",
                accountAddress,
                "Query result:",
                userData
              );
              toast.error("Could not award points - profile not found");
              return;
            }

            // Existing user - award points
            await addPoints(
              accountAddress,
              POINTS_ACTIONS.FAUCET.id,
              POINTS_ACTIONS.FAUCET.points,
              currentPoints,
              userProfile.id,
              userOpHash,
              ZERODEV_CONFIG.chain.id
            );

            toast.success("You earned points for using the faucet! 🎉", {
              description: "Check your profile to see your points balance.",
            });
          } catch (error) {
            console.error("Error awarding points:", error);
            toast.warning(
              "Token claim successful, but points were not awarded",
              {
                description: "We'll try to award your points later.",
              }
            );
          }
        },
      });

      console.log("Mint transaction completed:", userOpHash);
    } catch (error) {
      console.error("Error minting:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      toast.error("Failed to claim tokens", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleMint}
        disabled={isLoading || !account || isLoadingProfile}
      >
        {isLoading ? "Minting..." : "Get Test Tokens"}
      </Button>

      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
    </div>
  );
}
