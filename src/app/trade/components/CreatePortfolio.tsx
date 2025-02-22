"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { X, Plus, Lightbulb, ShieldCheck, Scale, TrendingUp, Flame, AlertCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Bitcoin,
  Coins,
  DollarSign,
  Link as LinkIcon,
  Lock,
} from "lucide-react";
import { useTokenBalances, TOKENS } from "@/contexts/TokenBalanceContext";
import Image from "next/image";
import { useAccount } from "@/contexts/AccountContext";
import { publicClient } from "@/lib/passkey";
import PORTFOLIO_FACTORY_ABI from "@/contracts/artifacts/SmartBasket.json";
import addresses from "@/contracts/addresses.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { account, client } = useAccount();
  const { tokens } = useTokenBalances();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!account || !client) return;

    try {
      setIsLoading(true);

      const tokenAddresses = Object.values(tokens).map(
        (token) => token.address
      );
      const { request } = await publicClient.simulateContract({
        account: account.address,
        address: addresses.portfolioFactory as `0x${string}`,
        abi: PORTFOLIO_FACTORY_ABI.abi,
        functionName: "createPortfolio",
        args: [tokenAddresses],
      });

      const hash = await client.sendTransaction(request);
      console.log("Create portfolio transaction:", hash);
    } catch (error) {
      console.error("Error creating portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isLoading || !account}
      className="w-full"
    >
      {isLoading ? "Creating..." : "Create Portfolio"}
    </Button>
  );
}
