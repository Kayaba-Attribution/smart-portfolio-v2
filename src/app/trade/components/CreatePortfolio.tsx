"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  X,
  Plus,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  Scale,
  TrendingUp,
  Flame,
} from "lucide-react";

import { useTokenBalances, TOKENS } from "@/contexts/TokenBalanceContext";
import Image from "next/image";
import { useAccount } from "@/contexts/AccountContext";
import { parseUnits } from "viem";
import ERC20_ABI from "@/contracts/artifacts/ERC20_BASE.json";
import addresses from "@/contracts/addresses.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { publicClient } from "@/lib/web3";

// Risk template definitions
type RiskTemplate = {
  id: string;
  name: string;
  description: string;
  allocation: { [K in keyof typeof TOKENS]?: number };
};

// Risk template definitions
const RISK_TEMPLATES: Record<string, RiskTemplate> = {
  low: {
    id: "low",
    name: "Low Risk",
    description:
      "A stable portfolio with 60% Stablecoins, 20% BTC, and 20% LINK.",
    allocation: {
      USDC: 60,
      WBTC: 20,
      LINK: 20,
    },
  },
  balanced: {
    id: "balanced",
    name: "Balanced Growth",
    description:
      "A mix of stable assets and growth tokens: 40% Stablecoins, 30% BTC, 30% ETH.",
    allocation: {
      USDC: 40,
      WBTC: 30,
      WBASE: 30,
    },
  },
  high: {
    id: "high",
    name: "High Growth",
    description:
      "A growth-focused portfolio with 20% Stablecoins, 40% BTC, and 40% Altcoins.",
    allocation: {
      USDC: 20,
      WBTC: 40,
      WBASE: 20,
      LINK: 20,
    },
  },
  degen: {
    id: "degen",
    name: "Degen Play",
    description:
      "A high-risk, high-reward portfolio with meme coins and minimal stability.",
    allocation: {
      PEPE: 30,
      SHIB: 30,
      DOGE: 20,
      FLOKI: 20,
    },
  },
};

// Update template icons mapping to use Lucide components
const TEMPLATE_ICONS = {
  low: ShieldCheck,
  balanced: Scale,
  high: TrendingUp,
  degen: Flame,
} as const;

export function CreatePortfolio() {
  const [mode, setMode] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [amount, setAmount] = useState("");
  const [customTokens, setCustomTokens] = useState<
    Array<{ symbol: string; allocation: number }>
  >([]);
  const [showInfo, setShowInfo] = useState(true);
  const { tokens } = useTokenBalances();
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));
  const { account, sendUserOp } = useAccount();
  const [isAddingToken, setIsAddingToken] = useState(false);
  const [newToken, setNewToken] = useState({ symbol: "", allocation: 0 });
  const [totalAllocation, setTotalAllocation] = useState(0);
  const [isApproving, setIsApproving] = useState(false);

  // Move checkAllowance outside useEffect
  const checkAllowance = async () => {
    if (!account) return;

    const accountAddress = await account.getAddress();
    const allowance = (await publicClient.readContract({
      address: addresses.tokens.USDC as `0x${string}`,
      abi: ERC20_ABI.abi,
      functionName: "allowance",
      args: [accountAddress, addresses.core.SmartPortfolio as `0x${string}`],
    })) as bigint;

    setAllowance(allowance);
  };

  // Get allowance data
  useEffect(() => {
    checkAllowance();
  }, [account]);

  // Handle token approval
  const handleApprove = async () => {
    if (!account) return;

    try {
      setIsApproving(true);

      const userOpHash = await sendUserOp({
        contractAddress: addresses.tokens.USDC,
        contractABI: ERC20_ABI.abi,
        functionName: "approve",
        args: [
          addresses.core.SmartPortfolio as `0x${string}`,
          parseUnits("999999999", 18), // Max approval amount
        ],
        onSuccess: () => {
          // Refresh allowance after successful approval
          checkAllowance();
        },
      });

      console.log("Approval transaction sent:", userOpHash);
    } catch (error) {
      console.error("Error approving token:", error);
    } finally {
      setIsApproving(false);
    }
  };

  // Convert tokens from context to the format we need
  const availableTokens = Object.entries(tokens).map(([symbol, token]) => ({
    symbol,
    name: token.name,
    icon: token.icon,
  }));

  // Update total allocation when tokens change
  useEffect(() => {
    const total = customTokens.reduce(
      (sum, token) => sum + token.allocation,
      0
    );
    setTotalAllocation(total);
  }, [customTokens]);

  // Update total allocation when new token changes
  useEffect(() => {
    const total =
      customTokens.reduce((sum, token) => sum + token.allocation, 0) +
      newToken.allocation;
    setTotalAllocation(total);
  }, [customTokens, newToken.allocation]);

  const handleAddToken = () => {
    if (!newToken.symbol || customTokens.length >= 5) return;

    const totalWithNew = totalAllocation;
    if (totalWithNew > 100) return;

    const updatedTokens = [...customTokens, newToken];
    setCustomTokens(updatedTokens);
    setNewToken({ symbol: "", allocation: 0 });
    setIsAddingToken(false);
  };

  const handleRemoveToken = (index: number) => {
    const newTokens = customTokens.filter((_, i) => i !== index);

    if (newTokens.length > 0) {
      // Recalculate allocations
      const equalShare = Math.floor(100 / newTokens.length);
      const totalEqualShares = equalShare * newTokens.length;
      const remainder = 100 - totalEqualShares;

      newTokens.forEach((token) => {
        token.allocation = equalShare;
      });

      // Distribute remainder if any
      for (let i = 0; i < remainder; i++) {
        newTokens[i].allocation += 1;
      }
    }

    setCustomTokens(newTokens);
  };

  // const updateAllocation = (index: number, value: number) => {
  //   const newTokens = [...customTokens];
  //   const oldAllocation = newTokens[index].allocation;
  //   const difference = value - oldAllocation;

  //   // Don't proceed if trying to set below 0 or above 100
  //   if (value < 0 || value > 100) return;

  //   // Calculate total allocation excluding current token
  //   const totalOthers = newTokens.reduce((sum, token, idx) =>
  //     idx !== index ? sum + token.allocation : sum, 0);

  //   // Don't proceed if this would make total allocation exceed 100
  //   if (totalOthers + value > 100) return;

  //   // Update current token allocation
  //   newTokens[index].allocation = value;

  //   // Distribute remaining percentage among other tokens proportionally
  //   const remaining = 100 - value;
  //   if (remaining > 0 && newTokens.length > 1) {
  //     const otherTokens = newTokens.filter((_, idx) => idx !== index);
  //     const totalOtherAllocations = otherTokens.reduce((sum, token) => sum + token.allocation, 0);

  //     newTokens.forEach((token, idx) => {
  //       if (idx !== index) {
  //         if (totalOtherAllocations === 0) {
  //           // If other allocations are 0, distribute equally
  //           token.allocation = remaining / (newTokens.length - 1);
  //         } else {
  //           // Otherwise, distribute proportionally
  //           token.allocation = (token.allocation / totalOtherAllocations) * remaining;
  //         }
  //       }
  //     });
  //   }

  //   setCustomTokens(newTokens);
  // };

  return (
    <div className="space-y-8">
      {/* Info Message */}
      {showInfo && (
        <div className="bg-muted/50 p-4 rounded-lg relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setShowInfo(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex gap-3 items-center">
            <Lightbulb className="h-6 w-6 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Create Your Investment Portfolio</p>
              <p className="text-sm text-muted-foreground">
                Choose a pre-made risk template or create your own custom mix.
                Set your investment amount and we&apos;ll handle the token swaps
                automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="flex gap-4">
        <Button
          variant={mode === "template" ? "default" : "outline"}
          onClick={() => setMode("template")}
          className="flex-1"
        >
          Risk Templates
        </Button>
        <Button
          variant={mode === "custom" ? "default" : "outline"}
          onClick={() => setMode("custom")}
          className="flex-1"
        >
          Custom Mix
        </Button>
      </div>

      {/* Template Mode */}
      {mode === "template" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Risk Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(RISK_TEMPLATES).map(([key, template]) => {
              const IconComponent =
                TEMPLATE_ICONS[key as keyof typeof TEMPLATE_ICONS];
              return (
                <div
                  key={key}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
                    selectedTemplate === key
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => setSelectedTemplate(key)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(template.allocation).map(
                          ([token, percentage]) => (
                            <div
                              key={token}
                              className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full"
                            >
                              {tokens[token]?.icon && (
                                <Image
                                  src={tokens[token].icon || ""}
                                  alt={token}
                                  width={12}
                                  height={12}
                                  className="rounded-full"
                                />
                              )}
                              <span>
                                {token} {percentage}%
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Mode */}
      {mode === "custom" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Create Custom Portfolio</h2>
            <p className="text-sm text-muted-foreground">
              Select up to 5 tokens
            </p>
          </div>

          <div className="space-y-4">
            {customTokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-2 w-[180px]">
                  {tokens[token.symbol]?.icon && (
                    <Image
                      src={tokens[token.symbol].icon || ""}
                      alt={token.symbol}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span className="font-medium">{token.symbol}</span>
                </div>
                <div className="flex-1 text-right font-medium">
                  {token.allocation}%
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveToken(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Dialog open={isAddingToken} onOpenChange={setIsAddingToken}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={customTokens.length >= 5}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Token ({customTokens.length}/5)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Token</DialogTitle>
                  <DialogDescription>
                    Select a token to add to your portfolio
                  </DialogDescription>
                </DialogHeader>

                {/* Existing Tokens Display */}
                {customTokens.length > 0 && (
                  <div className="py-4 border-y">
                    <div className="text-sm font-medium mb-2">
                      Current Allocation
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customTokens.map((token) => (
                        <div
                          key={token.symbol}
                          className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded-full text-sm"
                        >
                          {tokens[token.symbol]?.icon && (
                            <Image
                              src={tokens[token.symbol].icon || ""}
                              alt={token.symbol}
                              width={16}
                              height={16}
                              className="rounded-full"
                            />
                          )}
                          <span>{token.symbol}</span>
                          <span className="font-medium">
                            {token.allocation}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Token</label>
                    <Select
                      value={newToken.symbol}
                      onValueChange={(value) =>
                        setNewToken({ ...newToken, symbol: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a token" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTokens
                          .filter(
                            (t) =>
                              !customTokens.some((ct) => ct.symbol === t.symbol)
                          )
                          .map((t) => (
                            <SelectItem key={t.symbol} value={t.symbol}>
                              <span className="flex items-center gap-2">
                                {t.icon && (
                                  <Image
                                    src={t.icon || ""}
                                    alt={t.name}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                  />
                                )}
                                {t.name}
                              </span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">Allocation</label>
                      <span
                        className={`text-sm ${
                          totalAllocation > 100
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        Total: {totalAllocation}%
                      </span>
                    </div>
                    <Slider
                      value={[newToken.allocation]}
                      onValueChange={(value) =>
                        setNewToken({ ...newToken, allocation: value[0] })
                      }
                      max={100}
                      step={1}
                      className="py-4"
                    />
                    {totalAllocation > 100 && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>Total allocation cannot exceed 100%</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleAddToken}
                    disabled={!newToken.symbol || totalAllocation > 100}
                  >
                    Add Token
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Enter amount in USDC"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!account}
          />
        </div>
        {!account ? (
          <Button className="w-[200px]" disabled>
            Connect Account First
          </Button>
        ) : allowance === BigInt(0) ? (
          <Button
            className="w-[200px]"
            onClick={handleApprove}
            disabled={isApproving}
          >
            {isApproving ? "Approving..." : "Approve USDC Spending"}
          </Button>
        ) : (
          <Button className="w-[200px]">Create Portfolio</Button>
        )}
      </div>
    </div>
  );
}
