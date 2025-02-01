"use client";

import { useState } from "react";
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
import { X, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Lightbulb,
  Bitcoin,
  Coins,
  DollarSign,
  Link as LinkIcon,
  Lock,
  Scale,
  Rocket,
} from "lucide-react";

// Risk template definitions
const RISK_TEMPLATES = {
  low: {
    name: "Low Risk",
    description: "Stable Portfolio with 60% Stablecoins, 20% BTC, 20% LINK",
    allocation: {
      USDC: 60,
      WBTC: 20,
      LINK: 20,
    },
  },
  medium: {
    name: "Medium Risk",
    description: "Balanced Portfolio with 40% Stablecoins, 30% BTC, 30% ETH",
    allocation: {
      USDC: 40,
      WBTC: 30,
      ETH: 30,
    },
  },
  high: {
    name: "High Risk",
    description: "Growth Portfolio with 20% Stablecoins, 40% BTC, 40% ALTs",
    allocation: {
      USDC: 20,
      WBTC: 40,
      ETH: 20,
      LINK: 20,
    },
  },
};

// Available tokens for custom portfolio
const AVAILABLE_TOKENS = [
  { symbol: "WBTC", name: "Bitcoin", icon: Bitcoin },
  { symbol: "ETH", name: "Ethereum", icon: Coins },
  { symbol: "USDC", name: "USD Coin", icon: DollarSign },
  { symbol: "LINK", name: "Chainlink", icon: LinkIcon },
];

export function CreatePortfolio() {
  const [mode, setMode] = useState<"template" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [amount, setAmount] = useState("");
  const [customTokens, setCustomTokens] = useState<Array<{ symbol: string; allocation: number }>>([]);
  const [showInfo, setShowInfo] = useState(true);

  const handleAddToken = () => {
    if (customTokens.length < AVAILABLE_TOKENS.length) {
      setCustomTokens([...customTokens, { symbol: "", allocation: 0 }]);
    }
  };

  const handleRemoveToken = (index: number) => {
    setCustomTokens(customTokens.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, value: number) => {
    const newTokens = [...customTokens];
    newTokens[index].allocation = value;
    setCustomTokens(newTokens);
  };

  return (
    <div className="space-y-6">
      {/* Info Message */}
      {showInfo && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setShowInfo(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex gap-3 items-center">
              <Lightbulb className="h-6 w-6 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Create Your Investment Portfolio</p>
                <p className="text-sm text-muted-foreground">
                  Choose a pre-made risk template or create your own custom mix. Set your investment amount and we'll handle the token swaps automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode Selection */}
      <div className="flex gap-4">
        <Button
          variant={mode === "template" ? "default" : "outline"}
          onClick={() => setMode("template")}
        >
          Risk Templates
        </Button>
        <Button
          variant={mode === "custom" ? "default" : "outline"}
          onClick={() => setMode("custom")}
        >
          Custom Mix
        </Button>
      </div>

      {/* Template Mode */}
      {mode === "template" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Risk Template</CardTitle>
            <CardDescription>
              Choose a pre-defined portfolio strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    Low Risk <Lock className="h-4 w-4" />
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    Medium Risk <Scale className="h-4 w-4" />
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    High Risk <Rocket className="h-4 w-4" />
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {selectedTemplate && (
              <Collapsible>
                <CollapsibleTrigger className="flex w-full justify-between p-4 bg-muted rounded-lg">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    {RISK_TEMPLATES[selectedTemplate as keyof typeof RISK_TEMPLATES].name}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 bg-muted/50 rounded-lg mt-2">
                  {RISK_TEMPLATES[selectedTemplate as keyof typeof RISK_TEMPLATES].description}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Mode */}
      {mode === "custom" && (
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Portfolio</CardTitle>
            <CardDescription>
              Select tokens and allocate percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {customTokens.map((token, index) => (
              <div key={index} className="flex items-center gap-4">
                <Select
                  value={token.symbol}
                  onValueChange={(value) => {
                    const newTokens = [...customTokens];
                    newTokens[index].symbol = value;
                    setCustomTokens(newTokens);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_TOKENS.map((t) => (
                      <SelectItem key={t.symbol} value={t.symbol}>
                        <span className="flex items-center gap-2">
                          <t.icon className="h-4 w-4" /> {t.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex-1">
                  <Slider
                    value={[token.allocation]}
                    onValueChange={(value) => updateAllocation(index, value[0])}
                    max={100}
                    step={1}
                  />
                </div>
                <div className="w-16 text-right">{token.allocation}%</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveToken(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              onClick={handleAddToken}
              variant="outline"
              className="w-full"
              disabled={customTokens.length >= AVAILABLE_TOKENS.length}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Token
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Common Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Enter amount in USDT"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button className="w-[200px]">Create Portfolio</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 