"use client";

import { useAccount } from "wagmi";
import { encodeFunctionData } from "viem";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
  type LifecycleStatus,
} from "@coinbase/onchainkit/transaction";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ERC20_FAUCET_ABI } from "../abi/erc20Faucet";

const USDC_ADDRESS = "0xCE8565457Cca0fC7542608A2c78610Ed7bC66C8C";
const BASE_SEPOLIA_CHAIN_ID = 84532;

export function Faucet() {
  const { address } = useAccount();

  const calls = [
    {
      to: USDC_ADDRESS,
      data: encodeFunctionData({
        abi: ERC20_FAUCET_ABI,
        functionName: "claimFaucet",
        args: [],
      }),
    },
  ];

  const handleStatus = (status: LifecycleStatus) => {
    console.log("Transaction status:", status);
  };

  if (!address) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>USDC Faucet</CardTitle>
        <CardDescription>
          Claim test USDC tokens on Base Sepolia
        </CardDescription>
      </CardHeader>

      <div className="p-6">
        <Transaction
          chainId={BASE_SEPOLIA_CHAIN_ID}
          calls={calls}
          isSponsored={true}
          onStatus={handleStatus}
        >
          <div className="space-y-4">
            <TransactionButton className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Claim USDC
            </TransactionButton>

            <TransactionSponsor />

            <TransactionStatus>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </div>
            </TransactionStatus>
          </div>
        </Transaction>
      </div>
    </Card>
  );
}
