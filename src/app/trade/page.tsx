"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TradePage() {
  return (
    <div className="container p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Swap Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Swap interface will go here */}
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Swap interface coming soon
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Charts will go here */}
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Price charts coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 