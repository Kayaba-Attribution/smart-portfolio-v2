"use client";

import { useAccount } from "wagmi";
import { encodeFunctionData } from "viem";
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionToast,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionToastAction,
  type LifecycleStatus,
} from "@coinbase/onchainkit/transaction";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";

import { ERC20_FAUCET_ABI } from "../abi/erc20Faucet";
import { useState } from "react";

const USDC_ADDRESS = "0xCE8565457Cca0fC7542608A2c78610Ed7bC66C8C";
const BASE_SEPOLIA_CHAIN_ID = 84532;

export function Faucet() {
  const { address } = useAccount();
  const [key, setKey] = useState(0);

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
    if (status.statusName === 'transactionSuccess') {
      setTimeout(() => setKey(prev => prev + 1), 2000);
    }
  };

  if (!address) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          USDC Faucet
        </CardTitle>
        <CardDescription>
          Claim test USDC tokens on Base Sepolia
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Transaction
          key={key}
          chainId={BASE_SEPOLIA_CHAIN_ID}
          calls={calls}
          isSponsored={true}
          onStatus={handleStatus}
        >
          <div className="space-y-4">
            <TransactionButton 
              text="Claim USDC"
              successOverride={{
                text: "Claim Again",
                onClick: () => setKey(prev => prev + 1)
              }}
            />
            
            <div className="text-sm text-gray-500">
              <TransactionSponsor/>
            </div>

            <TransactionToast>
              <div className="flex items-center gap-2">
                <TransactionToastIcon />
                <TransactionToastLabel />
                <TransactionToastAction />
              </div>
            </TransactionToast>
          </div>
        </Transaction>
      </CardContent>
    </Card>
  );
}
