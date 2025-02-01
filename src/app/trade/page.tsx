"use client";

import { PageWrapper } from "@/components/PageWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TradePage() {
  return (
    <PageWrapper>
      <Tabs defaultValue="swap" className="w-full mx-auto">
        <div className="border-b">
          <TabsList className="h-16">
            <TabsTrigger value="swap" className="flex-1 text-lg data-[state=active]:bg-background">
              <span className="flex items-center gap-2">
                Swap Tokens <span className="text-xl">🔄</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1 text-lg data-[state=active]:bg-background">
              <span className="flex items-center gap-2">
                Create Portfolio <span className="text-xl">📊</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="swap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Swap Tokens</CardTitle>
              <CardDescription>
                Quick and easy token swaps with best price routing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Swap interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Portfolio</CardTitle>
              <CardDescription>
                AI-powered portfolio creation and management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Portfolio creation interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}
